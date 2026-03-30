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
import {
  normalizeDateValue,
  normalizeMonthValue,
  normalizeMultilineText,
  normalizeText,
  toPositiveAmount,
} from "@/utils/validators";

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
    (left, right) => {
      const leftTime = new Date(left.date).getTime();
      const rightTime = new Date(right.date).getTime();
      return (Number.isNaN(rightTime) ? 0 : rightTime) - (Number.isNaN(leftTime) ? 0 : leftTime);
    }
  );
}

/**
 * @param {any} payload
 * @returns {{ ok: boolean, data?: { title: string, amount: number, category: string, date: string, type: "income" | "expense", notes: string }, message?: string }}
 */
function normalizeTransactionPayload(payload) {
  const title = normalizeText(payload?.title, { maxLength: 120 });
  const amount = toPositiveAmount(payload?.amount);
  const category = normalizeText(payload?.category, { maxLength: 60 });
  const date = normalizeDateValue(payload?.date);
  const notes = normalizeMultilineText(payload?.notes, { maxLength: 1000 });
  const type = payload?.type === "income" ? "income" : payload?.type === "expense" ? "expense" : "";

  if (!title) {
    return { ok: false, message: "A transaction title is required." };
  }

  if (amount === null) {
    return { ok: false, message: "Amount must be a positive number." };
  }

  if (!category) {
    return { ok: false, message: "Select a category." };
  }

  if (!date) {
    return { ok: false, message: "Choose a valid date." };
  }

  if (!type) {
    return { ok: false, message: "Choose income or expense." };
  }

  return {
    ok: true,
    data: {
      title,
      amount,
      category,
      date,
      type,
      notes,
    },
  };
}

/**
 * @param {any} payload
 * @returns {{ ok: boolean, data?: { category: string, month: string, monthlyLimit: number, notes: string }, message?: string }}
 */
function normalizeBudgetPayload(payload) {
  const category = normalizeText(payload?.category, { maxLength: 60 });
  const month = normalizeMonthValue(payload?.month);
  const monthlyLimit = toPositiveAmount(payload?.monthlyLimit);
  const notes = normalizeMultilineText(payload?.notes, { maxLength: 1000 });

  if (!category) {
    return { ok: false, message: "Pick a category." };
  }

  if (!month) {
    return { ok: false, message: "Choose a valid month." };
  }

  if (monthlyLimit === null) {
    return { ok: false, message: "Budget must be a positive number." };
  }

  return {
    ok: true,
    data: {
      category,
      month,
      monthlyLimit,
      notes,
    },
  };
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

    const normalized = normalizeTransactionPayload(payload);

    if (!normalized.ok) {
      return normalized;
    }

    const timestamp = new Date().toISOString();
    const transaction = {
      id: crypto.randomUUID(),
      title: normalized.data.title,
      amount: normalized.data.amount,
      category: normalized.data.category,
      date: normalized.data.date,
      type: normalized.data.type,
      notes: normalized.data.notes,
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
    const existingTransaction = appState.transactions.find(
      (transaction) => transaction.id === transactionId
    );

    if (!existingTransaction) {
      return { ok: false, message: "Transaction was not found." };
    }

    const normalized = normalizeTransactionPayload({
      ...existingTransaction,
      ...payload,
    });

    if (!normalized.ok) {
      return normalized;
    }

    setAppState((currentState) => ({
      ...currentState,
      transactions: sortTransactions(
        currentState.transactions.map((transaction) =>
          transaction.id === transactionId
            ? {
                ...transaction,
                ...normalized.data,
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

    const normalized = normalizeBudgetPayload(payload);

    if (!normalized.ok) {
      return normalized;
    }

    const timestamp = new Date().toISOString();
    const budget = {
      id: budgetId || crypto.randomUUID(),
      category: normalized.data.category,
      month: normalized.data.month,
      monthlyLimit: normalized.data.monthlyLimit,
      notes: normalized.data.notes,
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
      exportWorkspace: () =>
        exportNamespaceData(loadedNamespace || getStorageNamespace(session)),
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
