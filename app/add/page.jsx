"use client";

import TransactionForm from "@/components/finance/TransactionForm";

// Add Transaction page - a clean form for adding income or expenses
export default function AddTransactionPage() {
  return (
    <div className="max-w-lg mx-auto px-4 py-8">
      {/* Page Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-foreground text-balance">
          Add Transaction
        </h1>
        <p className="text-muted-foreground mt-1">
          Record a new income or expense.
        </p>
      </div>

      {/* Form Card */}
      <div className="bg-card rounded-xl border border-border p-6 shadow-sm">
        <TransactionForm />
      </div>
    </div>
  );
}
