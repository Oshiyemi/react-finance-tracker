"use client";

import { useFinance } from "@/context/FinanceContext";
import TransactionItem from "./TransactionItem";
import EmptyState from "./EmptyState";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

// Shows the 5 most recent transactions on the dashboard
export default function RecentTransactions() {
  const { transactions, deleteTransaction } = useFinance();

  // Only show the latest 5
  const recentTransactions = transactions.slice(0, 5);

  return (
    <div className="bg-card rounded-xl border border-border p-6 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-base font-semibold text-foreground">
          Recent Transactions
        </h3>
        {transactions.length > 0 && (
          <Link
            href="/transactions"
            className="flex items-center gap-1 text-sm text-primary hover:underline"
          >
            View All
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        )}
      </div>

      {recentTransactions.length === 0 ? (
        <EmptyState message="No transactions yet. Start by adding one!" />
      ) : (
        <div className="flex flex-col gap-2">
          {recentTransactions.map((t) => (
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
