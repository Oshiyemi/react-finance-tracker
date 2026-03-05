import {
  AUTH_ATTEMPT_WINDOW_MINUTES,
  AUTH_MAX_LOGIN_ATTEMPTS,
  GUEST_NAMESPACE,
  GUEST_TRIAL_DAYS,
  STORAGE_SCHEMA_VERSION,
} from "@/utils/constants";

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
};
const GUEST_TRIAL_MS = GUEST_TRIAL_DAYS * 24 * 60 * 60 * 1000;
const AUTH_ATTEMPT_WINDOW_MS = AUTH_ATTEMPT_WINDOW_MINUTES * 60 * 1000;

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
 * @param {string} namespace
 * @returns {string}
 */
function getAppKey(namespace) {
  return `${STORAGE_ROOT}:app:${namespace}`;
}

/**
 * @param {any} legacyTransaction
 * @returns {{ id: string, title: string, amount: number, category: string, date: string, type: string, notes: string, createdAt: string, updatedAt: string }}
 */
function normalizeLegacyTransaction(legacyTransaction) {
  const timestamp = new Date().toISOString();

  return {
    id: legacyTransaction.id || crypto.randomUUID(),
    title: legacyTransaction.title || "Untitled transaction",
    amount: Number(legacyTransaction.amount) || 0,
    category: legacyTransaction.category || "Other",
    date: legacyTransaction.date || timestamp.slice(0, 10),
    type: legacyTransaction.type === "income" ? "income" : "expense",
    notes: legacyTransaction.notes || "",
    createdAt: legacyTransaction.createdAt || timestamp,
    updatedAt: legacyTransaction.updatedAt || timestamp,
  };
}

export function runStorageMigration() {
  const alreadyMigrated = localStorage.getItem(KEYS.migration);

  if (alreadyMigrated) {
    return;
  }

  const legacyTransactions = safeParse(
    localStorage.getItem(LEGACY_TRANSACTION_KEY),
    []
  );

  if (Array.isArray(legacyTransactions) && legacyTransactions.length > 0) {
    const guestAppKey = getAppKey(GUEST_NAMESPACE);
    const existingGuestData = safeParse(localStorage.getItem(guestAppKey), null);

    if (!existingGuestData) {
      const nextGuestState = createEmptyAppData();
      nextGuestState.transactions = legacyTransactions.map(normalizeLegacyTransaction);
      localStorage.setItem(guestAppKey, JSON.stringify(nextGuestState));
    }
  }

  localStorage.setItem(KEYS.migration, new Date().toISOString());
}

/**
 * @returns {any[]}
 */
export function loadAccounts() {
  const stored = safeParse(localStorage.getItem(KEYS.accounts), createEmptyAccountState());
  return toArray(stored.accounts);
}

/**
 * @param {any[]} accounts
 */
export function saveAccounts(accounts) {
  localStorage.setItem(
    KEYS.accounts,
    JSON.stringify({
      version: STORAGE_SCHEMA_VERSION,
      updatedAt: new Date().toISOString(),
      accounts: toArray(accounts),
    })
  );
}

/**
 * @returns {any | null}
 */
export function loadSession() {
  return safeParse(localStorage.getItem(KEYS.session), null);
}

/**
 * @param {any} session
 */
export function saveSession(session) {
  localStorage.setItem(KEYS.session, JSON.stringify(session));
}

export function clearSession() {
  localStorage.removeItem(KEYS.session);
}

/**
 * @returns {any[]}
 */
function loadGuestSessions() {
  const stored = safeParse(
    localStorage.getItem(KEYS.guestSessions),
    createEmptyGuestSessionState()
  );
  return toArray(stored.sessions);
}

/**
 * @param {any[]} sessions
 */
function saveGuestSessions(sessions) {
  localStorage.setItem(
    KEYS.guestSessions,
    JSON.stringify({
      version: STORAGE_SCHEMA_VERSION,
      updatedAt: new Date().toISOString(),
      sessions: toArray(sessions),
    })
  );
}

/**
 * @param {any} record
 * @returns {any}
 */
function normalizeGuestSessionRecord(record) {
  const createdAt = record?.createdAt || new Date().toISOString();
  const createdAtDate = new Date(createdAt);
  const createdAtTime = Number.isNaN(createdAtDate.getTime())
    ? Date.now()
    : createdAtDate.getTime();

  return {
    guestId: String(record?.guestId || ""),
    createdAt: new Date(createdAtTime).toISOString(),
    expiresAt:
      record?.expiresAt ||
      new Date(createdAtTime + GUEST_TRIAL_MS).toISOString(),
    migratedAt: record?.migratedAt || null,
    migratedToUserId: record?.migratedToUserId || null,
    userAgent: record?.userAgent || "",
    updatedAt: new Date().toISOString(),
  };
}

/**
 * @param {string} guestId
 * @returns {any | null}
 */
export function loadGuestSessionRecord(guestId) {
  if (!guestId) {
    return null;
  }

  return loadGuestSessions().find((session) => session.guestId === guestId) || null;
}

/**
 * @param {any} guestSessionRecord
 * @returns {any}
 */
export function upsertGuestSessionRecord(guestSessionRecord) {
  const record = normalizeGuestSessionRecord(guestSessionRecord);

  if (!record.guestId) {
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
  if (!guestId || !userId) {
    return null;
  }

  const record = loadGuestSessionRecord(guestId);

  if (!record) {
    return null;
  }

  const nextRecord = {
    ...record,
    migratedAt: record.migratedAt || new Date().toISOString(),
    migratedToUserId: userId,
  };

  upsertGuestSessionRecord(nextRecord);
  return nextRecord;
}

/**
 * @returns {string | null}
 */
export function loadActiveGuestId() {
  const value = localStorage.getItem(KEYS.activeGuestId);
  return value ? value : null;
}

/**
 * @param {string} guestId
 */
export function saveActiveGuestId(guestId) {
  if (!guestId) {
    return;
  }

  localStorage.setItem(KEYS.activeGuestId, guestId);
}

export function clearActiveGuestId() {
  localStorage.removeItem(KEYS.activeGuestId);
}

/**
 * @returns {{ guestId: string, userId: string, createdAt: string, lastError: string } | null}
 */
export function loadPendingGuestMigration() {
  const payload = safeParse(localStorage.getItem(KEYS.pendingGuestMigration), null);

  if (!payload || !payload.guestId || !payload.userId) {
    return null;
  }

  return {
    guestId: String(payload.guestId),
    userId: String(payload.userId),
    createdAt: payload.createdAt || new Date().toISOString(),
    lastError: payload.lastError || "",
  };
}

/**
 * @param {{ guestId: string, userId: string, createdAt?: string, lastError?: string }} payload
 */
export function savePendingGuestMigration(payload) {
  if (!payload?.guestId || !payload?.userId) {
    return;
  }

  localStorage.setItem(
    KEYS.pendingGuestMigration,
    JSON.stringify({
      guestId: payload.guestId,
      userId: payload.userId,
      createdAt: payload.createdAt || new Date().toISOString(),
      lastError: payload.lastError || "",
    })
  );
}

export function clearPendingGuestMigration() {
  localStorage.removeItem(KEYS.pendingGuestMigration);
}

/**
 * @param {string} email
 * @returns {string}
 */
function authKey(email) {
  return String(email || "").trim().toLowerCase();
}

/**
 * @returns {{ version: string, updatedAt: string, attempts: Record<string, number[]> }}
 */
function loadRateLimitState() {
  const stored = safeParse(localStorage.getItem(KEYS.authRateLimit), createEmptyRateLimitState());

  return {
    version: STORAGE_SCHEMA_VERSION,
    updatedAt: stored.updatedAt || new Date().toISOString(),
    attempts:
      stored.attempts && typeof stored.attempts === "object" ? stored.attempts : {},
  };
}

/**
 * @param {{ attempts: Record<string, number[]> }} state
 */
function saveRateLimitState(state) {
  localStorage.setItem(
    KEYS.authRateLimit,
    JSON.stringify({
      version: STORAGE_SCHEMA_VERSION,
      updatedAt: new Date().toISOString(),
      attempts: state.attempts,
    })
  );
}

/**
 * @param {number[]} values
 * @param {number} now
 * @returns {number[]}
 */
function pruneAttempts(values, now) {
  return toArray(values).filter((value) => now - Number(value) <= AUTH_ATTEMPT_WINDOW_MS);
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
  localStorage.setItem(KEYS.theme, theme);
}

/**
 * @returns {"light" | "dark" | null}
 */
export function loadTheme() {
  const theme = localStorage.getItem(KEYS.theme);
  return theme === "dark" || theme === "light" ? theme : null;
}

/**
 * @param {string} namespace
 * @returns {{ version: string, updatedAt: string, transactions: any[], budgets: any[] }}
 */
export function loadAppData(namespace) {
  runStorageMigration();
  const stored = safeParse(localStorage.getItem(getAppKey(namespace)), createEmptyAppData());

  return {
    version: STORAGE_SCHEMA_VERSION,
    updatedAt: stored.updatedAt || new Date().toISOString(),
    transactions: toArray(stored.transactions),
    budgets: toArray(stored.budgets),
  };
}

/**
 * @param {string} namespace
 * @param {{ transactions: any[], budgets: any[] }} data
 */
export function saveAppData(namespace, data) {
  localStorage.setItem(
    getAppKey(namespace),
    JSON.stringify({
      version: STORAGE_SCHEMA_VERSION,
      updatedAt: new Date().toISOString(),
      transactions: toArray(data.transactions),
      budgets: toArray(data.budgets),
    })
  );
}

/**
 * @param {string} namespace
 */
export function clearAppData(namespace) {
  localStorage.removeItem(getAppKey(namespace));
}

/**
 * @param {{ mode: string, userId: string }} session
 * @returns {string}
 */
export function getStorageNamespace(session) {
  if (!session) {
    return GUEST_NAMESPACE;
  }

  return session.mode === "account"
    ? `account:${session.userId}`
    : GUEST_NAMESPACE;
}

/**
 * @param {string} namespace
 * @returns {string}
 */
export function getStorageLabel(namespace) {
  return namespace === GUEST_NAMESPACE ? "Guest workspace" : namespace;
}

/**
 * @param {string} namespace
 * @returns {string}
 */
export function exportNamespaceData(namespace) {
  const session = loadSession();
  const payload = {
    exportedAt: new Date().toISOString(),
    schemaVersion: STORAGE_SCHEMA_VERSION,
    namespace,
    sessionMode: session?.mode || "guest",
    data: loadAppData(namespace),
  };

  return JSON.stringify(payload, null, 2);
}
