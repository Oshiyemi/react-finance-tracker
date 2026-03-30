import {
  AUTH_ATTEMPT_WINDOW_MINUTES,
  AUTH_MAX_LOGIN_ATTEMPTS,
  GUEST_NAMESPACE,
  GUEST_TRIAL_DAYS,
  STORAGE_SCHEMA_VERSION,
} from "@/utils/constants";
import {
  EMAIL_PATTERN,
  normalizeEmail,
  normalizeMonthValue,
  normalizeMultilineText,
  normalizeText,
  toPositiveAmount,
} from "@/utils/validators";

const STORAGE_ROOT = `fintrack:${STORAGE_SCHEMA_VERSION}`;
const LEGACY_TRANSACTION_KEY = "finance-transactions";
const KEYS = {
  accounts: `${STORAGE_ROOT}:accounts`,
  session: `${STORAGE_ROOT}:session`,
  theme: `${STORAGE_ROOT}:theme`,
  migration: `${STORAGE_ROOT}:migration`,
  guestSessions: `${STORAGE_ROOT}:guest-sessions`,
  activeGuestId: `${STORAGE_ROOT}:active-guest-id`,
  pendingGuestMigration: `${STORAGE_ROOT}:pending-guest-migration`,
  authRateLimit: `${STORAGE_ROOT}:auth-rate-limit`,
  tutorial: `${STORAGE_ROOT}:tutorial`,
};
const GUEST_TRIAL_MS = GUEST_TRIAL_DAYS * 24 * 60 * 60 * 1000;
const AUTH_ATTEMPT_WINDOW_MS = AUTH_ATTEMPT_WINDOW_MINUTES * 60 * 1000;
const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

/**
 * @returns {{ version: string, updatedAt: string, transactions: any[], budgets: any[] }}
 */
function createEmptyAppData() {
  return {
    version: STORAGE_SCHEMA_VERSION,
    updatedAt: new Date().toISOString(),
    transactions: [],
    budgets: [],
  };
}

/**
 * @returns {{ version: string, updatedAt: string, accounts: any[] }}
 */
function createEmptyAccountState() {
  return {
    version: STORAGE_SCHEMA_VERSION,
    updatedAt: new Date().toISOString(),
    accounts: [],
  };
}

/**
 * @returns {{ version: string, updatedAt: string, sessions: any[] }}
 */
function createEmptyGuestSessionState() {
  return {
    version: STORAGE_SCHEMA_VERSION,
    updatedAt: new Date().toISOString(),
    sessions: [],
  };
}

/**
 * @returns {{ version: string, updatedAt: string, attempts: Record<string, number[]> }}
 */
function createEmptyRateLimitState() {
  return {
    version: STORAGE_SCHEMA_VERSION,
    updatedAt: new Date().toISOString(),
    attempts: {},
  };
}

/**
 * @returns {{ version: string, updatedAt: string, completed: boolean, dismissed: boolean, completedAt: string | null, dismissedAt: string | null, lastOpenedAt: string | null }}
 */
function createEmptyTutorialState() {
  return {
    version: STORAGE_SCHEMA_VERSION,
    updatedAt: new Date().toISOString(),
    completed: false,
    dismissed: false,
    completedAt: null,
    dismissedAt: null,
    lastOpenedAt: null,
  };
}

/**
 * @returns {boolean}
 */
function hasStorageAccess() {
  return typeof window !== "undefined" && typeof window.localStorage !== "undefined";
}

/**
 * @param {string} key
 * @returns {string | null}
 */
function readStorage(key) {
  if (!hasStorageAccess()) {
    return null;
  }

  try {
    return window.localStorage.getItem(key);
  } catch (error) {
    console.warn("Storage read failed.", error);
    return null;
  }
}

/**
 * @param {string} key
 * @param {string} value
 */
function writeStorage(key, value) {
  if (!hasStorageAccess()) {
    return;
  }

  try {
    window.localStorage.setItem(key, value);
  } catch (error) {
    console.warn("Storage write failed.", error);
  }
}

/**
 * @param {string} key
 */
function removeStorage(key) {
  if (!hasStorageAccess()) {
    return;
  }

  try {
    window.localStorage.removeItem(key);
  } catch (error) {
    console.warn("Storage remove failed.", error);
  }
}

/**
 * @template T
 * @param {string | null} rawValue
 * @param {T} fallback
 * @returns {T}
 */
function safeParse(rawValue, fallback) {
  if (!rawValue) {
    return fallback;
  }

  try {
    return JSON.parse(rawValue);
  } catch (error) {
    console.warn("Storage parse failed, using fallback.", error);
    return fallback;
  }
}

/**
 * @param {any} value
 * @returns {any[]}
 */
function toArray(value) {
  return Array.isArray(value) ? value : [];
}

/**
 * @param {unknown} value
 * @returns {string}
 */
function toId(value) {
  return normalizeText(value, { maxLength: 120 });
}

/**
 * @param {unknown} value
 * @param {string} fallback
 * @returns {string}
 */
function normalizeIsoDate(value, fallback = new Date().toISOString()) {
  const timestamp = new Date(String(value || "")).getTime();
  return Number.isNaN(timestamp) ? fallback : new Date(timestamp).toISOString();
}

/**
 * @param {unknown} value
 * @returns {string}
 */
function normalizeDate(value) {
  const nextValue = normalizeText(value, { maxLength: 10 });
  return DATE_PATTERN.test(nextValue) ? nextValue : new Date().toISOString().slice(0, 10);
}

/**
 * @param {string} namespace
 * @returns {string}
 */
function getAppKey(namespace) {
  return `${STORAGE_ROOT}:app:${namespace}`;
}

/**
 * @param {Array<Record<string, any>>} records
 * @returns {Array<Record<string, any>>}
 */
function dedupeById(records) {
  const map = new Map();

  records.forEach((record) => {
    if (!record?.id || map.has(record.id)) {
      return;
    }

    map.set(record.id, record);
  });

  return Array.from(map.values());
}

/**
 * @param {any} legacyTransaction
 * @returns {{ id: string, title: string, amount: number, category: string, date: string, type: "income" | "expense", notes: string, createdAt: string, updatedAt: string }}
 */
function normalizeTransaction(legacyTransaction) {
  const timestamp = new Date().toISOString();
  const amount = toPositiveAmount(legacyTransaction?.amount);
  const createdAt = normalizeIsoDate(legacyTransaction?.createdAt, timestamp);
  const updatedAt = normalizeIsoDate(legacyTransaction?.updatedAt, createdAt);

  return {
    id: toId(legacyTransaction?.id) || crypto.randomUUID(),
    title:
      normalizeText(legacyTransaction?.title, { maxLength: 120 }) ||
      "Untitled transaction",
    amount: amount === null ? 0 : amount,
    category: normalizeText(legacyTransaction?.category, { maxLength: 60 }) || "Other",
    date: normalizeDate(legacyTransaction?.date),
    type: legacyTransaction?.type === "income" ? "income" : "expense",
    notes: normalizeMultilineText(legacyTransaction?.notes, { maxLength: 1000 }),
    createdAt,
    updatedAt,
  };
}

/**
 * @param {any} value
 * @returns {{ id: string, category: string, month: string, monthlyLimit: number, notes: string, createdAt: string, updatedAt: string }}
 */
function normalizeBudget(value) {
  const timestamp = new Date().toISOString();
  const monthlyLimit = toPositiveAmount(value?.monthlyLimit);
  const normalizedMonth = normalizeMonthValue(value?.month);
  const createdAt = normalizeIsoDate(value?.createdAt, timestamp);

  return {
    id: toId(value?.id) || crypto.randomUUID(),
    category: normalizeText(value?.category, { maxLength: 60 }) || "Other",
    month: normalizedMonth || new Date().toISOString().slice(0, 7),
    monthlyLimit: monthlyLimit === null ? 0 : monthlyLimit,
    notes: normalizeMultilineText(value?.notes, { maxLength: 1000 }),
    createdAt,
    updatedAt: normalizeIsoDate(value?.updatedAt, createdAt),
  };
}

/**
 * @param {any} value
 * @returns {{ algorithm: string, iterations: number, salt: string, digest: string } | null}
 */
function normalizePasswordRecord(value) {
  if (!value || value.algorithm !== "pbkdf2-sha256") {
    return null;
  }

  const salt = normalizeText(value.salt, { maxLength: 128 }).toLowerCase();
  const digest = normalizeText(value.digest, { maxLength: 128 }).toLowerCase();
  const iterations = Number.parseInt(String(value.iterations ?? ""), 10);

  if (!/^[a-f0-9]{32}$/i.test(salt)) {
    return null;
  }

  if (!/^[a-f0-9]{64}$/i.test(digest)) {
    return null;
  }

  if (!Number.isFinite(iterations) || iterations < 10_000 || iterations > 2_000_000) {
    return null;
  }

  return {
    algorithm: "pbkdf2-sha256",
    iterations,
    salt,
    digest,
  };
}

/**
 * @param {any} account
 * @returns {any | null}
 */
function normalizeAccount(account) {
  const email = normalizeEmail(account?.email);

  if (!email || !EMAIL_PATTERN.test(email)) {
    return null;
  }

  const password = normalizePasswordRecord(account?.password);
  const legacyPasswordHash = normalizeText(account?.passwordHash, { maxLength: 256 });

  if (!password && !legacyPasswordHash) {
    return null;
  }

  return {
    id: toId(account?.id) || crypto.randomUUID(),
    name: normalizeText(account?.name, { maxLength: 80 }) || "Unnamed user",
    email,
    password,
    passwordHash: password ? undefined : legacyPasswordHash,
    createdAt: normalizeIsoDate(account?.createdAt),
  };
}

/**
 * @param {any} session
 * @returns {any | null}
 */
function normalizeSession(session) {
  if (!session || typeof session !== "object") {
    return null;
  }

  if (session.mode === "account") {
    const email = normalizeEmail(session.email);
    const userId = toId(session.userId);

    if (!userId || !email || !EMAIL_PATTERN.test(email)) {
      return null;
    }

    return {
      mode: "account",
      userId,
      name: normalizeText(session.name, { maxLength: 80 }) || "Account user",
      email,
      createdAt: normalizeIsoDate(session.createdAt),
    };
  }

  if (session.mode === "guest") {
    const guestId = toId(session.guestId || session.userId);

    if (!guestId) {
      return null;
    }

    const createdAt = normalizeIsoDate(session.createdAt);

    return {
      mode: "guest",
      userId: guestId,
      guestId,
      name: "Guest",
      email: "",
      createdAt,
      guestCreatedAt: normalizeIsoDate(session.guestCreatedAt, createdAt),
      guestExpiresAt: normalizeIsoDate(
        session.guestExpiresAt,
        new Date(new Date(createdAt).getTime() + GUEST_TRIAL_MS).toISOString()
      ),
    };
  }

  return null;
}

/**
 * @param {any} record
 * @returns {any | null}
 */
function normalizeGuestSessionRecord(record) {
  const guestId = toId(record?.guestId);

  if (!guestId) {
    return null;
  }

  const createdAt = normalizeIsoDate(record?.createdAt);
  const defaultExpiresAt = new Date(new Date(createdAt).getTime() + GUEST_TRIAL_MS).toISOString();
  const migratedAt = record?.migratedAt ? normalizeIsoDate(record.migratedAt) : null;
  const migratedToUserId = migratedAt ? toId(record?.migratedToUserId) || null : null;

  return {
    guestId,
    createdAt,
    expiresAt: normalizeIsoDate(record?.expiresAt, defaultExpiresAt),
    migratedAt,
    migratedToUserId,
    userAgent: normalizeText(record?.userAgent, { maxLength: 280 }),
    updatedAt: normalizeIsoDate(record?.updatedAt),
  };
}

/**
 * @param {any} payload
 * @returns {{ guestId: string, userId: string, createdAt: string, lastError: string } | null}
 */
function normalizePendingMigration(payload) {
  const guestId = toId(payload?.guestId);
  const userId = toId(payload?.userId);

  if (!guestId || !userId) {
    return null;
  }

  return {
    guestId,
    userId,
    createdAt: normalizeIsoDate(payload?.createdAt),
    lastError: normalizeText(payload?.lastError, { maxLength: 240 }),
  };
}

/**
 * @param {Record<string, any>} attempts
 * @returns {Record<string, number[]>}
 */
function normalizeAttempts(attempts) {
  if (!attempts || typeof attempts !== "object") {
    return {};
  }

  return Object.entries(attempts).reduce((accumulator, [email, values]) => {
    const key = normalizeEmail(email);

    if (!key || !EMAIL_PATTERN.test(key)) {
      return accumulator;
    }

    const timestamps = toArray(values)
      .map((value) => Number(value))
      .filter((value) => Number.isFinite(value) && value > 0)
      .sort((left, right) => left - right)
      .slice(-AUTH_MAX_LOGIN_ATTEMPTS * 3);

    accumulator[key] = timestamps;
    return accumulator;
  }, {});
}

/**
 * @param {any} value
 * @returns {{ version: string, updatedAt: string, completed: boolean, dismissed: boolean, completedAt: string | null, dismissedAt: string | null, lastOpenedAt: string | null }}
 */
function normalizeTutorialState(value) {
  const fallback = createEmptyTutorialState();
  const completed = Boolean(value?.completed);
  const dismissed = Boolean(value?.dismissed);

  return {
    version: STORAGE_SCHEMA_VERSION,
    updatedAt: normalizeIsoDate(value?.updatedAt, fallback.updatedAt),
    completed,
    dismissed,
    completedAt: completed ? normalizeIsoDate(value?.completedAt) : null,
    dismissedAt: dismissed ? normalizeIsoDate(value?.dismissedAt) : null,
    lastOpenedAt: value?.lastOpenedAt ? normalizeIsoDate(value?.lastOpenedAt) : null,
  };
}

/**
 * @param {any} data
 * @returns {{ version: string, updatedAt: string, transactions: any[], budgets: any[] }}
 */
function normalizeAppData(data) {
  return {
    version: STORAGE_SCHEMA_VERSION,
    updatedAt: normalizeIsoDate(data?.updatedAt),
    transactions: dedupeById(toArray(data?.transactions).map(normalizeTransaction)),
    budgets: dedupeById(toArray(data?.budgets).map(normalizeBudget)),
  };
}

export function runStorageMigration() {
  const alreadyMigrated = readStorage(KEYS.migration);

  if (alreadyMigrated) {
    return;
  }

  const legacyTransactions = safeParse(readStorage(LEGACY_TRANSACTION_KEY), []);

  if (Array.isArray(legacyTransactions) && legacyTransactions.length > 0) {
    const guestAppKey = getAppKey(GUEST_NAMESPACE);
    const existingGuestData = safeParse(readStorage(guestAppKey), null);

    if (!existingGuestData) {
      const nextGuestState = createEmptyAppData();
      nextGuestState.transactions = legacyTransactions.map(normalizeTransaction);
      writeStorage(guestAppKey, JSON.stringify(nextGuestState));
    }
  }

  writeStorage(KEYS.migration, new Date().toISOString());
}

/**
 * @returns {any[]}
 */
export function loadAccounts() {
  const stored = safeParse(readStorage(KEYS.accounts), createEmptyAccountState());
  const normalizedAccounts = toArray(stored.accounts)
    .map(normalizeAccount)
    .filter(Boolean);

  const byEmail = new Map();

  normalizedAccounts.forEach((account) => {
    byEmail.set(account.email, account);
  });

  return Array.from(byEmail.values());
}

/**
 * @param {any[]} accounts
 */
export function saveAccounts(accounts) {
  const normalizedAccounts = toArray(accounts)
    .map(normalizeAccount)
    .filter(Boolean);

  writeStorage(
    KEYS.accounts,
    JSON.stringify({
      version: STORAGE_SCHEMA_VERSION,
      updatedAt: new Date().toISOString(),
      accounts: normalizedAccounts,
    })
  );
}

/**
 * @returns {any | null}
 */
export function loadSession() {
  return normalizeSession(safeParse(readStorage(KEYS.session), null));
}

/**
 * @param {any} session
 */
export function saveSession(session) {
  const normalizedSession = normalizeSession(session);

  if (!normalizedSession) {
    clearSession();
    return;
  }

  writeStorage(KEYS.session, JSON.stringify(normalizedSession));
}

export function clearSession() {
  removeStorage(KEYS.session);
}

/**
 * @returns {any[]}
 */
function loadGuestSessions() {
  const stored = safeParse(readStorage(KEYS.guestSessions), createEmptyGuestSessionState());

  return toArray(stored.sessions)
    .map(normalizeGuestSessionRecord)
    .filter(Boolean);
}

/**
 * @param {any[]} sessions
 */
function saveGuestSessions(sessions) {
  writeStorage(
    KEYS.guestSessions,
    JSON.stringify({
      version: STORAGE_SCHEMA_VERSION,
      updatedAt: new Date().toISOString(),
      sessions: dedupeById(
        toArray(sessions)
          .map(normalizeGuestSessionRecord)
          .filter(Boolean)
          .map((session) => ({ ...session, id: session.guestId }))
      ).map(({ id, ...session }) => session),
    })
  );
}

/**
 * @param {string} guestId
 * @returns {any | null}
 */
export function loadGuestSessionRecord(guestId) {
  const normalizedGuestId = toId(guestId);

  if (!normalizedGuestId) {
    return null;
  }

  return (
    loadGuestSessions().find((session) => session.guestId === normalizedGuestId) || null
  );
}

/**
 * @param {any} guestSessionRecord
 * @returns {any}
 */
export function upsertGuestSessionRecord(guestSessionRecord) {
  const record = normalizeGuestSessionRecord(guestSessionRecord);

  if (!record?.guestId) {
    throw new Error("Guest session must include a guestId.");
  }

  const sessions = loadGuestSessions();
  const nextSessions = sessions.some((session) => session.guestId === record.guestId)
    ? sessions.map((session) =>
        session.guestId === record.guestId ? { ...session, ...record } : session
      )
    : [...sessions, record];

  saveGuestSessions(nextSessions);
  return record;
}

/**
 * @param {string} guestId
 * @param {string} userId
 * @returns {any | null}
 */
export function markGuestSessionMigrated(guestId, userId) {
  const normalizedGuestId = toId(guestId);
  const normalizedUserId = toId(userId);

  if (!normalizedGuestId || !normalizedUserId) {
    return null;
  }

  const record = loadGuestSessionRecord(normalizedGuestId);

  if (!record) {
    return null;
  }

  const nextRecord = {
    ...record,
    migratedAt: record.migratedAt || new Date().toISOString(),
    migratedToUserId: normalizedUserId,
  };

  upsertGuestSessionRecord(nextRecord);
  return nextRecord;
}

/**
 * @returns {string | null}
 */
export function loadActiveGuestId() {
  const value = readStorage(KEYS.activeGuestId);
  const normalized = toId(value);

  return normalized || null;
}

/**
 * @param {string} guestId
 */
export function saveActiveGuestId(guestId) {
  const normalized = toId(guestId);

  if (!normalized) {
    return;
  }

  writeStorage(KEYS.activeGuestId, normalized);
}

export function clearActiveGuestId() {
  removeStorage(KEYS.activeGuestId);
}

/**
 * @returns {{ guestId: string, userId: string, createdAt: string, lastError: string } | null}
 */
export function loadPendingGuestMigration() {
  return normalizePendingMigration(safeParse(readStorage(KEYS.pendingGuestMigration), null));
}

/**
 * @param {{ guestId: string, userId: string, createdAt?: string, lastError?: string }} payload
 */
export function savePendingGuestMigration(payload) {
  const normalizedPayload = normalizePendingMigration(payload);

  if (!normalizedPayload) {
    return;
  }

  writeStorage(KEYS.pendingGuestMigration, JSON.stringify(normalizedPayload));
}

export function clearPendingGuestMigration() {
  removeStorage(KEYS.pendingGuestMigration);
}

/**
 * @param {string} email
 * @returns {string}
 */
function authKey(email) {
  return normalizeEmail(email);
}

/**
 * @returns {{ version: string, updatedAt: string, attempts: Record<string, number[]> }}
 */
function loadRateLimitState() {
  const stored = safeParse(readStorage(KEYS.authRateLimit), createEmptyRateLimitState());

  return {
    version: STORAGE_SCHEMA_VERSION,
    updatedAt: normalizeIsoDate(stored.updatedAt),
    attempts: normalizeAttempts(stored.attempts),
  };
}

/**
 * @param {{ attempts: Record<string, number[]> }} state
 */
function saveRateLimitState(state) {
  writeStorage(
    KEYS.authRateLimit,
    JSON.stringify({
      version: STORAGE_SCHEMA_VERSION,
      updatedAt: new Date().toISOString(),
      attempts: normalizeAttempts(state.attempts),
    })
  );
}

/**
 * @param {number[]} values
 * @param {number} now
 * @returns {number[]}
 */
function pruneAttempts(values, now) {
  return toArray(values)
    .map((value) => Number(value))
    .filter((value) => Number.isFinite(value) && now - value <= AUTH_ATTEMPT_WINDOW_MS)
    .sort((left, right) => left - right);
}

/**
 * @param {string} email
 * @returns {{ allowed: boolean, remainingAttempts: number, retryAfterMs: number }}
 */
export function canAttemptLogin(email) {
  const key = authKey(email);

  if (!key) {
    return {
      allowed: true,
      remainingAttempts: AUTH_MAX_LOGIN_ATTEMPTS,
      retryAfterMs: 0,
    };
  }

  const now = Date.now();
  const state = loadRateLimitState();
  const recentAttempts = pruneAttempts(state.attempts[key], now);

  if (recentAttempts.length < AUTH_MAX_LOGIN_ATTEMPTS) {
    return {
      allowed: true,
      remainingAttempts: AUTH_MAX_LOGIN_ATTEMPTS - recentAttempts.length,
      retryAfterMs: 0,
    };
  }

  const oldestAttempt = recentAttempts[0];

  return {
    allowed: false,
    remainingAttempts: 0,
    retryAfterMs: Math.max(AUTH_ATTEMPT_WINDOW_MS - (now - oldestAttempt), 1_000),
  };
}

/**
 * @param {string} email
 */
export function recordLoginFailure(email) {
  const key = authKey(email);

  if (!key) {
    return;
  }

  const now = Date.now();
  const state = loadRateLimitState();
  const existingAttempts = pruneAttempts(state.attempts[key], now);
  state.attempts[key] = [...existingAttempts, now];
  saveRateLimitState(state);
}

/**
 * @param {string} email
 */
export function clearLoginFailures(email) {
  const key = authKey(email);

  if (!key) {
    return;
  }

  const state = loadRateLimitState();

  if (!Object.prototype.hasOwnProperty.call(state.attempts, key)) {
    return;
  }

  delete state.attempts[key];
  saveRateLimitState(state);
}

/**
 * @returns {number}
 */
export function getGuestTrialDurationMs() {
  return GUEST_TRIAL_MS;
}

/**
 * @param {string} theme
 */
export function saveTheme(theme) {
  writeStorage(KEYS.theme, theme === "dark" ? "dark" : "light");
}

/**
 * @returns {"light" | "dark" | null}
 */
export function loadTheme() {
  const theme = readStorage(KEYS.theme);
  return theme === "dark" || theme === "light" ? theme : null;
}

/**
 * @param {string} namespace
 * @returns {{ version: string, updatedAt: string, transactions: any[], budgets: any[] }}
 */
export function loadAppData(namespace) {
  runStorageMigration();
  const safeNamespace = normalizeText(namespace, { maxLength: 160 }) || GUEST_NAMESPACE;
  const stored = safeParse(readStorage(getAppKey(safeNamespace)), createEmptyAppData());

  return normalizeAppData(stored);
}

/**
 * @param {string} namespace
 * @param {{ transactions: any[], budgets: any[] }} data
 */
export function saveAppData(namespace, data) {
  const safeNamespace = normalizeText(namespace, { maxLength: 160 }) || GUEST_NAMESPACE;
  const normalizedData = normalizeAppData(data);

  writeStorage(
    getAppKey(safeNamespace),
    JSON.stringify({
      version: STORAGE_SCHEMA_VERSION,
      updatedAt: new Date().toISOString(),
      transactions: normalizedData.transactions,
      budgets: normalizedData.budgets,
    })
  );
}

/**
 * @param {string} namespace
 */
export function clearAppData(namespace) {
  const safeNamespace = normalizeText(namespace, { maxLength: 160 }) || GUEST_NAMESPACE;
  removeStorage(getAppKey(safeNamespace));
}

/**
 * @param {{ mode: string, userId: string } | null} session
 * @returns {string}
 */
export function getStorageNamespace(session) {
  if (!session || session.mode !== "account") {
    return GUEST_NAMESPACE;
  }

  const userId = toId(session.userId);

  if (!userId) {
    return GUEST_NAMESPACE;
  }

  return `account:${userId}`;
}

/**
 * @param {string} namespace
 * @returns {string}
 */
export function getStorageLabel(namespace) {
  if (!namespace || namespace === GUEST_NAMESPACE) {
    return "Guest workspace";
  }

  if (namespace.startsWith("account:")) {
    return "Account workspace";
  }

  return namespace;
}

/**
 * @param {string} namespace
 * @returns {string}
 */
export function exportNamespaceData(namespace) {
  const safeNamespace = normalizeText(namespace, { maxLength: 160 }) || GUEST_NAMESPACE;
  const session = loadSession();
  const payload = {
    exportedAt: new Date().toISOString(),
    schemaVersion: STORAGE_SCHEMA_VERSION,
    namespace: safeNamespace,
    sessionMode: session?.mode || "guest",
    data: loadAppData(safeNamespace),
  };

  return JSON.stringify(payload, null, 2);
}

/**
 * @returns {{ version: string, updatedAt: string, completed: boolean, dismissed: boolean, completedAt: string | null, dismissedAt: string | null, lastOpenedAt: string | null }}
 */
export function loadTutorialState() {
  return normalizeTutorialState(safeParse(readStorage(KEYS.tutorial), createEmptyTutorialState()));
}

/**
 * @param {Partial<{ completed: boolean, dismissed: boolean, completedAt: string | null, dismissedAt: string | null, lastOpenedAt: string | null }>} patch
 * @returns {{ version: string, updatedAt: string, completed: boolean, dismissed: boolean, completedAt: string | null, dismissedAt: string | null, lastOpenedAt: string | null }}
 */
export function saveTutorialState(patch) {
  const current = loadTutorialState();
  const nextState = normalizeTutorialState({
    ...current,
    ...patch,
    updatedAt: new Date().toISOString(),
  });

  writeStorage(KEYS.tutorial, JSON.stringify(nextState));
  return nextState;
}

/**
 * @returns {{ version: string, updatedAt: string, completed: boolean, dismissed: boolean, completedAt: string | null, dismissedAt: string | null, lastOpenedAt: string | null }}
 */
export function dismissTutorial() {
  return saveTutorialState({
    dismissed: true,
    dismissedAt: new Date().toISOString(),
    lastOpenedAt: new Date().toISOString(),
  });
}

/**
 * @returns {{ version: string, updatedAt: string, completed: boolean, dismissed: boolean, completedAt: string | null, dismissedAt: string | null, lastOpenedAt: string | null }}
 */
export function completeTutorial() {
  const timestamp = new Date().toISOString();

  return saveTutorialState({
    completed: true,
    dismissed: true,
    completedAt: timestamp,
    dismissedAt: timestamp,
    lastOpenedAt: timestamp,
  });
}

/**
 * @returns {{ version: string, updatedAt: string, completed: boolean, dismissed: boolean, completedAt: string | null, dismissedAt: string | null, lastOpenedAt: string | null }}
 */
export function resetTutorialState() {
  const nextState = createEmptyTutorialState();
  writeStorage(KEYS.tutorial, JSON.stringify(nextState));
  return nextState;
}

