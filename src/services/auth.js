import {
  canAttemptLogin,
  clearActiveGuestId,
  clearAppData,
  clearLoginFailures,
  clearPendingGuestMigration,
  clearSession,
  getGuestTrialDurationMs,
  getStorageNamespace,
  loadAccounts,
  loadActiveGuestId,
  loadAppData,
  loadGuestSessionRecord,
  loadPendingGuestMigration,
  loadSession,
  markGuestSessionMigrated,
  recordLoginFailure,
  saveAccounts,
  saveActiveGuestId,
  saveAppData,
  savePendingGuestMigration,
  saveSession,
  upsertGuestSessionRecord,
} from "@/services/storage";
import { GUEST_NAMESPACE } from "@/utils/constants";
import { EMAIL_PATTERN, normalizeEmail, normalizeText } from "@/utils/validators";

const PASSWORD_ALGORITHM = "pbkdf2-sha256";
const PASSWORD_ITERATIONS = 210_000;
const PASSWORD_SALT_BYTES = 16;
const textEncoder = new TextEncoder();

/**
 * @param {Uint8Array} value
 * @returns {string}
 */
function bytesToHex(value) {
  return Array.from(value)
    .map((valuePart) => valuePart.toString(16).padStart(2, "0"))
    .join("");
}

/**
 * @param {string} value
 * @returns {Uint8Array}
 */
function hexToBytes(value) {
  if (!value || value.length % 2 !== 0) {
    return new Uint8Array();
  }

  const parts = value.match(/.{1,2}/g) || [];
  return new Uint8Array(
    parts
      .map((part) => Number.parseInt(part, 16))
      .map((part) => (Number.isFinite(part) ? part : 0))
  );
}

/**
 * Constant-time-ish string compare for same-process checks.
 * This does not replace server-side auth protections.
 * @param {string} left
 * @param {string} right
 * @returns {boolean}
 */
function safeEqual(left, right) {
  const a = String(left ?? "");
  const b = String(right ?? "");
  const length = Math.max(a.length, b.length);
  let mismatch = a.length ^ b.length;

  for (let index = 0; index < length; index += 1) {
    mismatch |= (a.charCodeAt(index) || 0) ^ (b.charCodeAt(index) || 0);
  }

  return mismatch === 0;
}

/**
 * Legacy hash for backward compatibility with existing browser-local accounts.
 * @param {string} value
 * @returns {Promise<string>}
 */
async function hashSecretLegacy(value) {
  const buffer = await crypto.subtle.digest("SHA-256", textEncoder.encode(value));
  return bytesToHex(new Uint8Array(buffer));
}

/**
 * @param {string} value
 * @param {string} saltHex
 * @param {number} iterations
 * @returns {Promise<string>}
 */
async function hashSecret(value, saltHex, iterations = PASSWORD_ITERATIONS) {
  const baseKey = await crypto.subtle.importKey(
    "raw",
    textEncoder.encode(value),
    "PBKDF2",
    false,
    ["deriveBits"]
  );
  const derivedBits = await crypto.subtle.deriveBits(
    {
      name: "PBKDF2",
      hash: "SHA-256",
      salt: hexToBytes(saltHex),
      iterations,
    },
    baseKey,
    256
  );

  return bytesToHex(new Uint8Array(derivedBits));
}

/**
 * @param {string} password
 * @returns {Promise<{ algorithm: string, iterations: number, salt: string, digest: string }>}
 */
async function createPasswordRecord(password) {
  const salt = crypto.getRandomValues(new Uint8Array(PASSWORD_SALT_BYTES));
  const saltHex = bytesToHex(salt);

  return {
    algorithm: PASSWORD_ALGORITHM,
    iterations: PASSWORD_ITERATIONS,
    salt: saltHex,
    digest: await hashSecret(password, saltHex, PASSWORD_ITERATIONS),
  };
}

/**
 * @param {any} account
 * @param {string} password
 * @returns {Promise<{ matches: boolean, shouldUpgradeLegacy: boolean }>}
 */
async function verifyAccountSecret(account, password) {
  if (account?.password?.algorithm === PASSWORD_ALGORITHM) {
    const digest = await hashSecret(
      password,
      account.password.salt,
      Number(account.password.iterations) || PASSWORD_ITERATIONS
    );

    return {
      matches: safeEqual(digest, account.password.digest),
      shouldUpgradeLegacy: false,
    };
  }

  if (typeof account?.passwordHash === "string") {
    const digest = await hashSecretLegacy(password);
    const matches = safeEqual(digest, account.passwordHash);

    return {
      matches,
      shouldUpgradeLegacy: matches,
    };
  }

  return {
    matches: false,
    shouldUpgradeLegacy: false,
  };
}

/**
 * @param {{ id: string, name: string, email: string }} account
 * @returns {{ mode: "account", userId: string, name: string, email: string, createdAt: string }}
 */
function createAccountSession(account) {
  return {
    mode: "account",
    userId: account.id,
    name: account.name,
    email: account.email,
    createdAt: new Date().toISOString(),
  };
}

/**
 * @param {string} guestId
 * @param {string} createdAt
 * @returns {{ guestId: string, createdAt: string, expiresAt: string, migratedAt: null, migratedToUserId: null, userAgent: string }}
 */
function createGuestSessionRecord(guestId, createdAt) {
  const createdAtDate = new Date(createdAt);
  const createdAtTime = Number.isNaN(createdAtDate.getTime())
    ? Date.now()
    : createdAtDate.getTime();

  return {
    guestId,
    createdAt: new Date(createdAtTime).toISOString(),
    expiresAt: new Date(createdAtTime + getGuestTrialDurationMs()).toISOString(),
    migratedAt: null,
    migratedToUserId: null,
    userAgent: typeof navigator !== "undefined" ? navigator.userAgent : "",
  };
}

/**
 * @param {any} record
 * @returns {{ mode: "guest", userId: string, guestId: string, name: string, email: string, createdAt: string, guestCreatedAt: string, guestExpiresAt: string }}
 */
function createGuestSession(record) {
  return {
    mode: "guest",
    userId: record.guestId,
    guestId: record.guestId,
    name: "Guest",
    email: "",
    createdAt: record.createdAt,
    guestCreatedAt: record.createdAt,
    guestExpiresAt: record.expiresAt,
  };
}

/**
 * @param {any} session
 * @returns {any | null}
 */
function normalizeGuestSession(session) {
  const seededGuestId =
    session?.guestId ||
    (session?.userId && session.userId !== "guest" ? session.userId : "") ||
    loadActiveGuestId() ||
    crypto.randomUUID();
  const guestId = String(seededGuestId);

  const existingRecord = loadGuestSessionRecord(guestId);
  const seedCreatedAt = session?.guestCreatedAt || session?.createdAt || new Date().toISOString();
  const record = existingRecord || createGuestSessionRecord(guestId, seedCreatedAt);

  upsertGuestSessionRecord(record);
  saveActiveGuestId(guestId);

  const guestSession = createGuestSession(record);
  saveSession(guestSession);
  return guestSession;
}

/**
 * @param {any} session
 * @returns {{ isGuest: boolean, guestId: string | null, createdAt: string | null, expiresAt: string | null, remainingMs: number, daysRemaining: number, isExpired: boolean, isMigrated: boolean, isLocked: boolean, lockReason: "expired" | "migrated" | null }}
 */
export function getGuestSessionStatus(session) {
  if (!session || session.mode !== "guest") {
    return {
      isGuest: false,
      guestId: null,
      createdAt: null,
      expiresAt: null,
      remainingMs: 0,
      daysRemaining: 0,
      isExpired: false,
      isMigrated: false,
      isLocked: false,
      lockReason: null,
    };
  }

  const guestId = String(
    session.guestId ||
      (session.userId && session.userId !== "guest" ? session.userId : "") ||
      loadActiveGuestId() ||
      ""
  );

  const record = guestId ? loadGuestSessionRecord(guestId) : null;
  const createdAt = record?.createdAt || session.guestCreatedAt || session.createdAt;
  const fallbackExpiresAt = new Date(
    new Date(createdAt || new Date().toISOString()).getTime() + getGuestTrialDurationMs()
  ).toISOString();
  const expiresAt = record?.expiresAt || session.guestExpiresAt || fallbackExpiresAt;
  const expiresAtTime = new Date(expiresAt).getTime();
  const remainingMs = Number.isNaN(expiresAtTime) ? 0 : expiresAtTime - Date.now();
  const isExpired = remainingMs <= 0;
  const isMigrated = Boolean(record?.migratedAt);
  const isLocked = isExpired || isMigrated;

  return {
    isGuest: true,
    guestId: guestId || null,
    createdAt: createdAt || null,
    expiresAt,
    remainingMs,
    daysRemaining: Math.max(Math.ceil(remainingMs / (24 * 60 * 60 * 1000)), 0),
    isExpired,
    isMigrated,
    isLocked,
    lockReason: isMigrated ? "migrated" : isExpired ? "expired" : null,
  };
}

/**
 * @param {{ name: string, email: string, password: string }} payload
 */
function assertRegisterPayload(payload) {
  const name = normalizeText(payload?.name, { maxLength: 80 });
  const email = normalizeEmail(payload?.email);
  const passwordLength = String(payload?.password ?? "").trim().length;

  if (!name || name.length < 2) {
    throw new Error("Full name must be at least 2 characters.");
  }

  if (!email || !EMAIL_PATTERN.test(email)) {
    throw new Error("Enter a valid email address.");
  }

  if (!passwordLength || passwordLength < 8 || passwordLength > 128) {
    throw new Error("Password must be between 8 and 128 characters.");
  }
}

/**
 * @param {{ email: string, password: string }} payload
 */
function assertLoginPayload(payload) {
  const email = normalizeEmail(payload?.email);
  const passwordLength = String(payload?.password ?? "").trim().length;

  if (!email || !EMAIL_PATTERN.test(email)) {
    throw new Error("Enter a valid email address.");
  }

  if (!passwordLength || passwordLength < 8 || passwordLength > 128) {
    throw new Error("Password must be between 8 and 128 characters.");
  }
}

/**
 * @param {any[]} records
 * @returns {any[]}
 */
function dedupeById(records) {
  const map = new Map();

  records.forEach((record) => {
    if (!record?.id) {
      return;
    }

    if (!map.has(record.id)) {
      map.set(record.id, record);
    }
  });

  return Array.from(map.values());
}

/**
 * @param {any[]} existingBudgets
 * @param {any[]} guestBudgets
 * @returns {any[]}
 */
function mergeBudgets(existingBudgets, guestBudgets) {
  const existingById = new Map(
    existingBudgets.filter((budget) => budget?.id).map((budget) => [budget.id, budget])
  );
  const existingByCategoryMonth = new Set(
    existingBudgets
      .filter((budget) => budget?.category && budget?.month)
      .map((budget) => `${budget.category}::${budget.month}`)
  );
  const mergedBudgets = [...existingBudgets];

  guestBudgets.forEach((budget) => {
    if (!budget?.id || existingById.has(budget.id)) {
      return;
    }

    const categoryMonth = `${budget.category}::${budget.month}`;

    if (existingByCategoryMonth.has(categoryMonth)) {
      return;
    }

    mergedBudgets.push(budget);
    existingById.set(budget.id, budget);
    existingByCategoryMonth.add(categoryMonth);
  });

  return mergedBudgets;
}

/**
 * @param {{ guestId: string, userSession: { mode: string, userId: string } }} payload
 * @returns {{ ok: boolean, alreadyMigrated: boolean, migratedTransactions: number, migratedBudgets: number, message: string }}
 */
export function migrateGuestDataToAccount(payload) {
  const guestId = String(payload?.guestId || "");
  const userSession = payload?.userSession;

  if (!guestId) {
    throw new Error("Missing guest session id.");
  }

  if (!userSession || userSession.mode !== "account" || !userSession.userId) {
    throw new Error("You must be authenticated to migrate guest data.");
  }

  const guestRecord = loadGuestSessionRecord(guestId);

  if (!guestRecord) {
    throw new Error("Guest session was not found.");
  }

  if (guestRecord.migratedAt) {
    if (guestRecord.migratedToUserId === userSession.userId) {
      clearPendingGuestMigration();
      return {
        ok: true,
        alreadyMigrated: true,
        migratedTransactions: 0,
        migratedBudgets: 0,
        message: "Guest data was already migrated to this account.",
      };
    }

    throw new Error("This guest session is already linked to another account.");
  }

  const guestData = loadAppData(GUEST_NAMESPACE);
  const accountNamespace = getStorageNamespace(userSession);
  const accountData = loadAppData(accountNamespace);

  const mergedTransactions = dedupeById([
    ...accountData.transactions,
    ...guestData.transactions,
  ]);
  const mergedBudgets = mergeBudgets(accountData.budgets, guestData.budgets);
  const migratedTransactions = Math.max(
    mergedTransactions.length - accountData.transactions.length,
    0
  );
  const migratedBudgets = Math.max(mergedBudgets.length - accountData.budgets.length, 0);

  saveAppData(accountNamespace, {
    transactions: mergedTransactions,
    budgets: mergedBudgets,
  });

  markGuestSessionMigrated(guestId, userSession.userId);
  clearPendingGuestMigration();
  clearActiveGuestId();
  clearAppData(GUEST_NAMESPACE);

  return {
    ok: true,
    alreadyMigrated: false,
    migratedTransactions,
    migratedBudgets,
    message: "Guest data migration completed.",
  };
}

/**
 * @returns {any | null}
 */
export function getStoredSession() {
  const session = loadSession();

  if (!session) {
    return null;
  }

  if (session.mode !== "guest") {
    return session;
  }

  const guestSession = normalizeGuestSession(session);

  if (guestSession) {
    return guestSession;
  }

  const activeGuestId = loadActiveGuestId();

  if (activeGuestId) {
    const activeRecord = loadGuestSessionRecord(activeGuestId);

    if (activeRecord && !activeRecord.migratedAt) {
      const normalizedSession = createGuestSession(activeRecord);
      saveSession(normalizedSession);
      return normalizedSession;
    }
  }

  return session;
}

/**
 * @returns {{ mode: "guest", userId: string, guestId: string, name: string, email: string, createdAt: string, guestCreatedAt: string, guestExpiresAt: string }}
 */
export function startGuestSession() {
  const activeGuestId = loadActiveGuestId();

  if (activeGuestId) {
    const activeGuestRecord = loadGuestSessionRecord(activeGuestId);

    if (activeGuestRecord && !activeGuestRecord.migratedAt) {
      const existingGuestSession = createGuestSession(activeGuestRecord);
      saveSession(existingGuestSession);
      return existingGuestSession;
    }
  }

  const guestId = crypto.randomUUID();
  const guestRecord = createGuestSessionRecord(guestId, new Date().toISOString());

  upsertGuestSessionRecord(guestRecord);
  saveActiveGuestId(guestId);

  const guestSession = createGuestSession(guestRecord);
  saveSession(guestSession);
  return guestSession;
}

/**
 * @param {{ name: string, email: string, password: string }} payload
 * @returns {Promise<{ session: any, migration: any }>}
 */
export async function registerAccount(payload) {
  assertRegisterPayload(payload);

  const accounts = loadAccounts();
  const email = normalizeEmail(payload.email);
  const name = normalizeText(payload.name, { maxLength: 80 });

  if (accounts.some((account) => account.email === email)) {
    throw new Error("An account with that email already exists.");
  }

  const currentSession = getStoredSession();
  const guestStatus = getGuestSessionStatus(currentSession);

  const account = {
    id: crypto.randomUUID(),
    name,
    email,
    password: await createPasswordRecord(String(payload.password)),
    createdAt: new Date().toISOString(),
  };

  saveAccounts([...accounts, account]);

  const session = createAccountSession(account);
  saveSession(session);
  clearLoginFailures(email);

  if (!guestStatus.isGuest || !guestStatus.guestId || guestStatus.isMigrated) {
    return {
      session,
      migration: {
        ok: true,
        skipped: true,
        message: "No guest data migration was needed.",
      },
    };
  }

  try {
    const migrationResult = migrateGuestDataToAccount({
      guestId: guestStatus.guestId,
      userSession: session,
    });

    return {
      session,
      migration: migrationResult,
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Guest data migration failed.";
    savePendingGuestMigration({
      guestId: guestStatus.guestId,
      userId: session.userId,
      createdAt: new Date().toISOString(),
      lastError: message,
    });

    return {
      session,
      migration: {
        ok: false,
        recoverable: true,
        message,
      },
    };
  }
}

/**
 * @param {{ email: string, password: string }} payload
 * @returns {Promise<any>}
 */
export async function loginAccount(payload) {
  assertLoginPayload(payload);

  const accounts = loadAccounts();
  const email = normalizeEmail(payload.email);
  const password = String(payload.password ?? "");
  const attemptStatus = canAttemptLogin(email);

  if (!attemptStatus.allowed) {
    const retryInMinutes = Math.ceil(attemptStatus.retryAfterMs / 60_000);
    throw new Error(
      `Too many failed login attempts. Please wait about ${retryInMinutes} minute(s) and try again.`
    );
  }

  const account = accounts.find((accountItem) => accountItem.email === email);

  if (!account) {
    recordLoginFailure(email);
    throw new Error("Email or password is incorrect.");
  }

  const verification = await verifyAccountSecret(account, password);

  if (!verification.matches) {
    recordLoginFailure(email);
    throw new Error("Email or password is incorrect.");
  }

  clearLoginFailures(email);

  if (verification.shouldUpgradeLegacy) {
    const upgradedPassword = await createPasswordRecord(password);
    const nextAccounts = accounts.map((accountItem) =>
      accountItem.id === account.id
        ? {
            ...accountItem,
            password: upgradedPassword,
            passwordHash: undefined,
          }
        : accountItem
    );

    saveAccounts(nextAccounts);
  }

  const session = createAccountSession(account);
  saveSession(session);

  return session;
}

/**
 * @param {{ mode: string, userId: string } | null} currentSession
 * @returns {{ hasPending: boolean, pending: any | null }}
 */
export function getPendingGuestMigrationForSession(currentSession) {
  const pending = loadPendingGuestMigration();

  if (!pending || !currentSession || currentSession.mode !== "account") {
    return { hasPending: false, pending: null };
  }

  if (pending.userId !== currentSession.userId) {
    return { hasPending: false, pending: null };
  }

  return { hasPending: true, pending };
}

/**
 * @param {{ mode: string, userId: string } | null} currentSession
 * @returns {{ ok: boolean, message: string, migration?: any }}
 */
export function retryPendingGuestMigration(currentSession) {
  const pending = loadPendingGuestMigration();

  if (!pending) {
    return {
      ok: true,
      message: "No pending guest migration found.",
    };
  }

  if (!currentSession || currentSession.mode !== "account") {
    return {
      ok: false,
      message: "You need an authenticated account session to retry migration.",
    };
  }

  if (pending.userId !== currentSession.userId) {
    return {
      ok: false,
      message: "Pending migration belongs to a different account.",
    };
  }

  try {
    const migration = migrateGuestDataToAccount({
      guestId: pending.guestId,
      userSession: currentSession,
    });

    return {
      ok: true,
      message: "Guest data migration completed successfully.",
      migration,
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Guest migration retry failed.";
    savePendingGuestMigration({
      guestId: pending.guestId,
      userId: pending.userId,
      createdAt: pending.createdAt,
      lastError: message,
    });

    return {
      ok: false,
      message,
    };
  }
}

export function logoutAccount() {
  clearSession();
}
