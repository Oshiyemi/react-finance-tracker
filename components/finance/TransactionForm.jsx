"use client";

import { useState } from "react";
import { useFinance, CATEGORIES } from "@/context/FinanceContext";
import { useRouter } from "next/navigation";
import { CheckCircle2, AlertCircle } from "lucide-react";

// Form for adding a new income or expense transaction
export default function TransactionForm() {
  const { addTransaction } = useFinance();
  const router = useRouter();

  // Form field state
  const [title, setTitle] = useState("");
  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState("");
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [type, setType] = useState("expense");

  // For showing validation errors and success message
  const [errors, setErrors] = useState({});
  const [showSuccess, setShowSuccess] = useState(false);

  // Validate all form fields before submitting
  const validateForm = () => {
    const newErrors = {};

    if (!title.trim()) {
      newErrors.title = "Title is required";
    }

    if (!amount || isNaN(Number(amount)) || Number(amount) <= 0) {
      newErrors.amount = "Please enter a valid positive number";
    }

    if (!category) {
      newErrors.category = "Please select a category";
    }

    if (!date) {
      newErrors.date = "Date is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle form submission
  const handleSubmit = (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    // Add the transaction through our context
    addTransaction({
      title: title.trim(),
      amount: Number(amount),
      category,
      date,
      type,
    });

    // Show success feedback
    setShowSuccess(true);

    // Reset the form
    setTitle("");
    setAmount("");
    setCategory("");
    setDate(new Date().toISOString().split("T")[0]);
    setType("expense");
    setErrors({});

    // Hide success message after 2 seconds and redirect
    setTimeout(() => {
      setShowSuccess(false);
      router.push("/transactions");
    }, 1500);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {/* Success message */}
      {showSuccess && (
        <div className="flex items-center gap-3 p-4 rounded-xl bg-income/10 border border-income/20">
          <CheckCircle2 className="w-5 h-5 text-income flex-shrink-0" />
          <p className="text-sm font-medium text-income">
            Transaction added successfully! Redirecting...
          </p>
        </div>
      )}

      {/* Transaction Type Toggle */}
      <div>
        <label className="block text-sm font-medium text-foreground mb-2">
          Type
        </label>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => setType("expense")}
            className={`flex-1 py-2.5 rounded-lg text-sm font-medium transition-all ${
              type === "expense"
                ? "bg-expense text-primary-foreground shadow-sm"
                : "bg-muted text-muted-foreground hover:bg-muted/80"
            }`}
          >
            Expense
          </button>
          <button
            type="button"
            onClick={() => setType("income")}
            className={`flex-1 py-2.5 rounded-lg text-sm font-medium transition-all ${
              type === "income"
                ? "bg-income text-primary-foreground shadow-sm"
                : "bg-muted text-muted-foreground hover:bg-muted/80"
            }`}
          >
            Income
          </button>
        </div>
      </div>

      {/* Title Input */}
      <div>
        <label
          htmlFor="title"
          className="block text-sm font-medium text-foreground mb-2"
        >
          Title
        </label>
        <input
          id="title"
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="e.g., Grocery shopping"
          className={`w-full px-4 py-2.5 rounded-lg border bg-background text-foreground text-sm focus:outline-none focus:ring-2 transition-colors ${
            errors.title
              ? "border-expense focus:ring-expense/30"
              : "border-border focus:ring-primary/30 focus:border-primary"
          }`}
        />
        {errors.title && (
          <div className="flex items-center gap-1.5 mt-1.5">
            <AlertCircle className="w-3.5 h-3.5 text-expense" />
            <p className="text-xs text-expense">{errors.title}</p>
          </div>
        )}
      </div>

      {/* Amount Input */}
      <div>
        <label
          htmlFor="amount"
          className="block text-sm font-medium text-foreground mb-2"
        >
          Amount ($)
        </label>
        <input
          id="amount"
          type="number"
          step="0.01"
          min="0"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          placeholder="0.00"
          className={`w-full px-4 py-2.5 rounded-lg border bg-background text-foreground text-sm focus:outline-none focus:ring-2 transition-colors ${
            errors.amount
              ? "border-expense focus:ring-expense/30"
              : "border-border focus:ring-primary/30 focus:border-primary"
          }`}
        />
        {errors.amount && (
          <div className="flex items-center gap-1.5 mt-1.5">
            <AlertCircle className="w-3.5 h-3.5 text-expense" />
            <p className="text-xs text-expense">{errors.amount}</p>
          </div>
        )}
      </div>

      {/* Category Select */}
      <div>
        <label
          htmlFor="category"
          className="block text-sm font-medium text-foreground mb-2"
        >
          Category
        </label>
        <select
          id="category"
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className={`w-full px-4 py-2.5 rounded-lg border bg-background text-foreground text-sm focus:outline-none focus:ring-2 transition-colors ${
            errors.category
              ? "border-expense focus:ring-expense/30"
              : "border-border focus:ring-primary/30 focus:border-primary"
          }`}
        >
          <option value="">Select a category</option>
          {CATEGORIES.map((cat) => (
            <option key={cat} value={cat}>
              {cat}
            </option>
          ))}
        </select>
        {errors.category && (
          <div className="flex items-center gap-1.5 mt-1.5">
            <AlertCircle className="w-3.5 h-3.5 text-expense" />
            <p className="text-xs text-expense">{errors.category}</p>
          </div>
        )}
      </div>

      {/* Date Input */}
      <div>
        <label
          htmlFor="date"
          className="block text-sm font-medium text-foreground mb-2"
        >
          Date
        </label>
        <input
          id="date"
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          className={`w-full px-4 py-2.5 rounded-lg border bg-background text-foreground text-sm focus:outline-none focus:ring-2 transition-colors ${
            errors.date
              ? "border-expense focus:ring-expense/30"
              : "border-border focus:ring-primary/30 focus:border-primary"
          }`}
        />
        {errors.date && (
          <div className="flex items-center gap-1.5 mt-1.5">
            <AlertCircle className="w-3.5 h-3.5 text-expense" />
            <p className="text-xs text-expense">{errors.date}</p>
          </div>
        )}
      </div>

      {/* Submit Button */}
      <button
        type="submit"
        className="w-full py-3 bg-primary text-primary-foreground rounded-lg text-sm font-semibold hover:opacity-90 transition-opacity shadow-sm"
      >
        Add Transaction
      </button>
    </form>
  );
}
