"use client";

import { useFinance } from "@/context/FinanceContext";
import SummaryCard from "@/components/finance/SummaryCard";
import CategoryChart from "@/components/finance/CategoryChart";
import RecentTransactions from "@/components/finance/RecentTransactions";
import { Wallet, TrendingUp, TrendingDown } from "lucide-react";

// Dashboard page - shows an overview of your finances
export default function Dashboard() {
  const { balance, totalIncome, totalExpenses, transactions, isLoaded } =
    useFinance();

  // Show a loading state while data loads from localStorage
  if (!isLoaded) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-8 h-8 border-3 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      {/* Page Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-foreground text-balance">
          Dashboard
        </h1>
        <p className="text-muted-foreground mt-1">
          Your financial overview at a glance.
        </p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        <SummaryCard
          title="Total Balance"
          amount={balance}
          icon={Wallet}
          type="balance"
        />
        <SummaryCard
          title="Total Income"
          amount={totalIncome}
          icon={TrendingUp}
          type="income"
        />
        <SummaryCard
          title="Total Expenses"
          amount={totalExpenses}
          icon={TrendingDown}
          type="expense"
        />
      </div>

      {/* Chart and Recent Transactions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <CategoryChart transactions={transactions} />
        <RecentTransactions />
      </div>
    </div>
  );
}
