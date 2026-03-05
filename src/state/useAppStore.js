import {
  createElement,
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import {
  clearAppData,
  exportNamespaceData,
  getStorageLabel,
  getStorageNamespace,
  loadAppData,
  saveAppData,
} from "@/services/storage";
import { useAuthStore } from "@/state/useAuthStore";

const AppContext = createContext(null);

function createEmptyState() {
  return {
    transactions: [],
    budgets: [],
  };
}

/**
 * @param {Array<Record<string, any>>} transactions
 * @returns {Array<Record<string, any>>}
 */
function sortTransactions(transactions) {
  return [...transactions].sort(
    (left, right) => new Date(right.date) - new Date(left.date)
  );
}

export function AppStoreProvider({ children }) {
  const {
    session,
    isReady: authReady,
    isGuest,
    isGuestLocked,
    guestLockReason,
  } = useAuthStore();
  const [appState, setAppState] = useState(createEmptyState());
  const [isReady, setIsReady] = useState(false);
  const [loadedNamespace, setLoadedNamespace] = useState("");

  function getReadOnlyMessage() {
    if (!session) {
      return "You need an active session to modify workspace data.";
    }

    if (!isGuest || !isGuestLocked) {
      return "";
    }

    if (guestLockReason === "migrated") {
      return "This guest session has already been migrated. Sign in with your account to continue.";
    }

    return "Guest access ended \u2014 create an account to keep your data.";
  }

  function getWriteGuardResult() {
    const message = getReadOnlyMessage();

    if (!message) {
      return null;
    }

    return {
      ok: false,
      message,
    };
  }

  useEffect(() => {
    if (!authReady) {
      return;
    }

    setIsReady(false);

    if (!session) {
      setAppState(createEmptyState());
      setLoadedNamespace("");
      setIsReady(true);
      return;
    }

    const namespace = getStorageNamespace(session);
    const stored = loadAppData(namespace);

    setAppState({
      transactions: sortTransactions(stored.transactions),
      budgets: stored.budgets,
    });
    setLoadedNamespace(namespace);
    setIsReady(true);
  }, [authReady, session]);

  useEffect(() => {
    if (!authReady || !session || !isReady || !loadedNamespace) {
      return;
    }

    saveAppData(loadedNamespace, appState);
  }, [appState, authReady, isReady, loadedNamespace, session]);

  function addTransaction(payload) {
    const blocked = getWriteGuardResult();

    if (blocked) {
      return blocked;
    }

    const timestamp = new Date().toISOString();
    const transaction = {
      id: crypto.randomUUID(),
      title: payload.title.trim(),
      amount: Number(payload.amount),
      category: payload.category,
      date: payload.date,
      type: payload.type,
      notes: payload.notes?.trim() || "",
      createdAt: timestamp,
      updatedAt: timestamp,
    };

    setAppState((currentState) => ({
      ...currentState,
      transactions: sortTransactions([transaction, ...currentState.transactions]),
    }));

    return { ok: true };
  }

  function updateTransaction(transactionId, payload) {
    const blocked = getWriteGuardResult();

    if (blocked) {
      return blocked;
    }

    setAppState((currentState) => ({
      ...currentState,
      transactions: sortTransactions(
        currentState.transactions.map((transaction) =>
          transaction.id === transactionId
            ? {
                ...transaction,
                ...payload,
                amount: Number(payload.amount),
                updatedAt: new Date().toISOString(),
              }
            : transaction
        )
      ),
    }));

    return { ok: true };
  }

  function deleteTransaction(transactionId) {
    const blocked = getWriteGuardResult();

    if (blocked) {
      return blocked;
    }

    setAppState((currentState) => ({
      ...currentState,
      transactions: currentState.transactions.filter(
        (transaction) => transaction.id !== transactionId
      ),
    }));

    return { ok: true };
  }

  function upsertBudget(payload, budgetId) {
    const blocked = getWriteGuardResult();

    if (blocked) {
      return blocked;
    }

    const timestamp = new Date().toISOString();
    const budget = {
      id: budgetId || crypto.randomUUID(),
      category: payload.category,
      month: payload.month,
      monthlyLimit: Number(payload.monthlyLimit),
      notes: payload.notes?.trim() || "",
      createdAt: timestamp,
      updatedAt: timestamp,
    };

    setAppState((currentState) => ({
      ...currentState,
      budgets: currentState.budgets.some((currentBudget) => currentBudget.id === budget.id)
        ? currentState.budgets.map((currentBudget) =>
            currentBudget.id === budget.id
              ? {
                  ...currentBudget,
                  ...budget,
                  createdAt: currentBudget.createdAt,
                }
              : currentBudget
          )
        : [...currentState.budgets, budget],
    }));

    return { ok: true };
  }

  function deleteBudget(budgetId) {
    const blocked = getWriteGuardResult();

    if (blocked) {
      return blocked;
    }

    setAppState((currentState) => ({
      ...currentState,
      budgets: currentState.budgets.filter((budget) => budget.id !== budgetId),
    }));

    return { ok: true };
  }

  function clearWorkspace() {
    const blocked = getWriteGuardResult();

    if (blocked) {
      return blocked;
    }

    if (!loadedNamespace) {
      return { ok: false, message: "No workspace is currently loaded." };
    }

    clearAppData(loadedNamespace);
    setAppState(createEmptyState());
    return { ok: true };
  }

  const value = useMemo(
    () => ({
      ...appState,
      isReady,
      isReadOnly: Boolean(getReadOnlyMessage()),
      readOnlyMessage: getReadOnlyMessage(),
      storageNamespace: loadedNamespace,
      storageLabel: getStorageLabel(loadedNamespace),
      addTransaction,
      updateTransaction,
      deleteTransaction,
      upsertBudget,
      deleteBudget,
      clearWorkspace,
      exportWorkspace: () => exportNamespaceData(loadedNamespace),
    }),
    [appState, isReady, loadedNamespace, guestLockReason, isGuest, isGuestLocked, session]
  );

  return createElement(AppContext.Provider, { value }, children);
}

export function useAppStore() {
  const context = useContext(AppContext);

  if (!context) {
    throw new Error("useAppStore must be used within an AppStoreProvider");
  }

  return context;
}
