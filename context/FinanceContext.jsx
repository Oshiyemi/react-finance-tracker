"use client";

import { createContext, useContext, useState, useEffect } from "react";

// Create the context for sharing finance data across pages
const FinanceContext = createContext();

// List of categories users can pick from
export const CATEGORIES = [
  "Food & Dining",
  "Transportation",
  "Housing",
  "Utilities",
  "Entertainment",
  "Shopping",
  "Healthcare",
  "Education",
  "Salary",
  "Freelance",
  "Investments",
  "Other",
];

// Colors for each category (used in charts)
export const CATEGORY_COLORS = {
  "Food & Dining": "#0d9488",
  Transportation: "#f59e0b",
  Housing: "#6366f1",
  Utilities: "#ec4899",
  Entertainment: "#8b5cf6",
  Shopping: "#f97316",
  Healthcare: "#06b6d4",
  Education: "#84cc16",
  Salary: "#10b981",
  Freelance: "#14b8a6",
  Investments: "#3b82f6",
  Other: "#94a3b8",
};

export function FinanceProvider({ children }) {
  // Load transactions from localStorage on first render
  const [transactions, setTransactions] = useState([]);
  const [isLoaded, setIsLoaded] = useState(false);

  // Load saved data from localStorage when the app starts
  useEffect(() => {
    try {
      const saved = localStorage.getItem("finance-transactions");
      if (saved) {
        setTransactions(JSON.parse(saved));
      }
    } catch (error) {
      console.error("Failed to load transactions:", error);
    }
    setIsLoaded(true);
  }, []);

  // Save transactions to localStorage whenever they change
  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem(
        "finance-transactions",
        JSON.stringify(transactions)
      );
    }
  }, [transactions, isLoaded]);

  // Add a new transaction to the list
  const addTransaction = (transaction) => {
    const newTransaction = {
      ...transaction,
      id: Date.now().toString(),
    };
    setTransactions((prev) => [newTransaction, ...prev]);
  };

  // Remove a transaction by its ID
  const deleteTransaction = (id) => {
    setTransactions((prev) => prev.filter((t) => t.id !== id));
  };

  // Calculate totals from all transactions
  const totalIncome = transactions
    .filter((t) => t.type === "income")
    .reduce((sum, t) => sum + Number(t.amount), 0);

  const totalExpenses = transactions
    .filter((t) => t.type === "expense")
    .reduce((sum, t) => sum + Number(t.amount), 0);

  const balance = totalIncome - totalExpenses;

  // The value we share with all child components
  const value = {
    transactions,
    addTransaction,
    deleteTransaction,
    totalIncome,
    totalExpenses,
    balance,
    isLoaded,
  };

  return (
    <FinanceContext.Provider value={value}>{children}</FinanceContext.Provider>
  );
}

// Custom hook to use finance data in any component
export function useFinance() {
  const context = useContext(FinanceContext);
  if (!context) {
    throw new Error("useFinance must be used within a FinanceProvider");
  }
  return context;
}
