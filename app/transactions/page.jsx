"use client";

import { useState, useMemo } from "react";
import { useFinance } from "@/context/FinanceContext";
import TransactionItem from "@/components/finance/TransactionItem";
import TransactionFilters from "@/components/finance/TransactionFilters";
import EmptyState from "@/components/finance/EmptyState";

// Transactions page - shows all transactions with filtering options
export default function TransactionsPage() {
  const { transactions, deleteTransaction, isLoaded } = useFinance();

  // Filter state
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [monthFilter, setMonthFilter] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");

  // Apply filters to the transaction list
  const filteredTransactions = useMemo(() => {
    return transactions.filter((t) => {
      // Check category filter
      if (categoryFilter !== "all" && t.category !== categoryFilter) {
        return false;
      }

      // Check type filter
      if (typeFilter !== "all" && t.type !== typeFilter) {
        return false;
      }

      // Check month filter (compare YYYY-MM format)
      if (monthFilter) {
        const transactionMonth = t.date.substring(0, 7); // "2025-01"
        if (transactionMonth !== monthFilter) {
          return false;
        }
      }

      return true;
    });
  }, [transactions, categoryFilter, monthFilter, typeFilter]);

  // Show a loading state while data loads from localStorage
  if (!isLoaded) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-8 h-8 border-3 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* Page Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-foreground text-balance">
          Transactions
        </h1>
        <p className="text-muted-foreground mt-1">
          View and manage all your transactions.
        </p>
      </div>

      {/* Filters */}
      <div className="mb-6">
        <TransactionFilters
          categoryFilter={categoryFilter}
          setCategoryFilter={setCategoryFilter}
          monthFilter={monthFilter}
          setMonthFilter={setMonthFilter}
          typeFilter={typeFilter}
          setTypeFilter={setTypeFilter}
        />
      </div>

      {/* Results count */}
      {transactions.length > 0 && (
        <p className="text-sm text-muted-foreground mb-4">
          Showing {filteredTransactions.length} of {transactions.length}{" "}
          transactions
        </p>
      )}

      {/* Transaction List */}
      {filteredTransactions.length === 0 ? (
        <EmptyState
          message={
            transactions.length === 0
              ? "No transactions yet. Start by adding one!"
              : "No transactions match your filters. Try adjusting them."
          }
          showAddButton={transactions.length === 0}
        />
      ) : (
        <div className="flex flex-col gap-2">
          {filteredTransactions.map((t) => (
            <TransactionItem
              key={t.id}
              transaction={t}
              onDelete={deleteTransaction}
            />
          ))}
        </div>
      )}
    </div>
  );
}
