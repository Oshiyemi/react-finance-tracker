"use client";

import { Trash2 } from "lucide-react";
import { CATEGORY_COLORS } from "@/context/FinanceContext";

// A single transaction row in the list
export default function TransactionItem({ transaction, onDelete }) {
  const { id, title, amount, category, date, type } = transaction;

  // Get the category color for the left accent bar
  const categoryColor = CATEGORY_COLORS[category] || "#94a3b8";

  return (
    <div className="group bg-card rounded-xl border border-border p-4 hover:shadow-md transition-all flex items-center gap-4">
      {/* Category color indicator */}
      <div
        className="w-1 h-12 rounded-full flex-shrink-0"
        style={{ backgroundColor: categoryColor }}
      />

      {/* Transaction details */}
      <div className="flex-1 min-w-0">
        <p className="font-medium text-foreground truncate">{title}</p>
        <div className="flex items-center gap-2 mt-1">
          <span className="text-xs px-2 py-0.5 rounded-full bg-muted text-muted-foreground">
            {category}
          </span>
          <span className="text-xs text-muted-foreground">{date}</span>
        </div>
      </div>

      {/* Amount display */}
      <p
        className={`text-base font-semibold flex-shrink-0 ${
          type === "income" ? "text-income" : "text-expense"
        }`}
      >
        {type === "income" ? "+" : "-"}$
        {Number(amount).toLocaleString("en-US", {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        })}
      </p>

      {/* Delete button - visible on hover */}
      <button
        onClick={() => onDelete(id)}
        className="p-2 rounded-lg text-muted-foreground hover:text-expense hover:bg-expense/10 transition-colors opacity-0 group-hover:opacity-100 flex-shrink-0"
        aria-label={`Delete transaction: ${title}`}
      >
        <Trash2 className="w-4 h-4" />
      </button>
    </div>
  );
}
