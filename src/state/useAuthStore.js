import {
  createElement,
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import {
  getGuestSessionStatus,
  getPendingGuestMigrationForSession,
  getStoredSession,
  loginAccount,
  logoutAccount,
  registerAccount,
  retryPendingGuestMigration,
  startGuestSession,
} from "@/services/auth";
import { loadTheme, runStorageMigration, saveTheme } from "@/services/storage";

const AuthContext = createContext(null);

/**
 * @param {"light" | "dark"} theme
 */
function applyTheme(theme) {
  document.documentElement.classList.toggle("dark", theme === "dark");
  document.documentElement.style.colorScheme = theme;
}

/**
 * @param {any | null} currentSession
 * @returns {any | null}
 */
function resolvePendingGuestMigration(currentSession) {
  const pendingState = getPendingGuestMigrationForSession(currentSession);
  return pendingState.hasPending ? pendingState.pending : null;
}

export function AuthProvider({ children }) {
  const [session, setSession] = useState(null);
  const [theme, setTheme] = useState("light");
  const [isReady, setIsReady] = useState(false);
  const [isAuthLoading, setIsAuthLoading] = useState(false);
  const [pendingGuestMigration, setPendingGuestMigration] = useState(null);
  const [guestStatusVersion, setGuestStatusVersion] = useState(0);

  useEffect(() => {
    runStorageMigration();
    const nextSession = getStoredSession();
    const storedTheme = loadTheme();
    const resolvedTheme =
      storedTheme ||
      (window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light");

    setSession(nextSession);
    setPendingGuestMigration(resolvePendingGuestMigration(nextSession));
    setTheme(resolvedTheme);
    applyTheme(resolvedTheme);

    if (!storedTheme) {
      saveTheme(resolvedTheme);
    }

    setIsReady(true);
  }, []);

  useEffect(() => {
    if (!isReady) {
      return;
    }

    applyTheme(theme);
    saveTheme(theme);
  }, [isReady, theme]);

  useEffect(() => {
    if (!session || session.mode !== "guest") {
      return undefined;
    }

    const status = getGuestSessionStatus(session);
    const intervalId = window.setInterval(() => {
      setGuestStatusVersion((value) => value + 1);
    }, 60_000);

    let timeoutId = null;

    if (!status.isExpired && status.expiresAt) {
      const expiresAtTime = new Date(status.expiresAt).getTime();
      const timeoutMs = Math.max(expiresAtTime - Date.now(), 0);
      timeoutId = window.setTimeout(() => {
        setGuestStatusVersion((value) => value + 1);
      }, Math.min(timeoutMs + 200, 2_147_000_000));
    }

    return () => {
      window.clearInterval(intervalId);

      if (timeoutId) {
        window.clearTimeout(timeoutId);
      }
    };
  }, [session]);

  async function login(payload) {
    setIsAuthLoading(true);

    try {
      const nextSession = await loginAccount(payload);
      setSession(nextSession);
      setPendingGuestMigration(resolvePendingGuestMigration(nextSession));
      return { ok: true, session: nextSession };
    } catch (error) {
      return {
        ok: false,
        message: error instanceof Error ? error.message : "Something went wrong.",
      };
    } finally {
      setIsAuthLoading(false);
    }
  }

  async function register(payload) {
    setIsAuthLoading(true);

    try {
      const result = await registerAccount(payload);
      setSession(result.session);
      setPendingGuestMigration(resolvePendingGuestMigration(result.session));

      return {
        ok: true,
        session: result.session,
        migration: result.migration,
      };
    } catch (error) {
      return {
        ok: false,
        message: error instanceof Error ? error.message : "Something went wrong.",
      };
    } finally {
      setIsAuthLoading(false);
    }
  }

  async function retryGuestMigration() {
    setIsAuthLoading(true);

    try {
      const result = retryPendingGuestMigration(session);

      if (result.ok) {
        setPendingGuestMigration(resolvePendingGuestMigration(session));
      } else {
        setPendingGuestMigration(resolvePendingGuestMigration(session));
      }

      return result;
    } finally {
      setIsAuthLoading(false);
    }
  }

  function continueAsGuest() {
    const guestSession = startGuestSession();
    setSession(guestSession);
    setPendingGuestMigration(resolvePendingGuestMigration(guestSession));
    return guestSession;
  }

  function logout() {
    logoutAccount();
    setSession(null);
    setPendingGuestMigration(null);
  }

  const guestStatus = useMemo(
    () => getGuestSessionStatus(session),
    [guestStatusVersion, session]
  );

  const value = useMemo(
    () => ({
      session,
      theme,
      isReady,
      isAuthLoading,
      hasSession: Boolean(session),
      isGuest: session?.mode === "guest",
      isAccount: session?.mode === "account",
      guestStatus,
      isGuestExpired: guestStatus.isExpired,
      isGuestLocked: guestStatus.isLocked,
      guestLockReason: guestStatus.lockReason,
      guestExpiresAt: guestStatus.expiresAt,
      guestDaysRemaining: guestStatus.daysRemaining,
      pendingGuestMigration,
      hasPendingGuestMigration: Boolean(pendingGuestMigration),
      continueAsGuest,
      login,
      register,
      retryGuestMigration,
      logout,
      toggleTheme: () =>
        setTheme((currentTheme) => (currentTheme === "dark" ? "light" : "dark")),
      setTheme,
    }),
    [
      guestStatus,
      isAuthLoading,
      isReady,
      pendingGuestMigration,
      session,
      theme,
    ]
  );

  return createElement(AuthContext.Provider, { value }, children);
}

export function useAuthStore() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuthStore must be used within an AuthProvider");
  }

  return context;
}
