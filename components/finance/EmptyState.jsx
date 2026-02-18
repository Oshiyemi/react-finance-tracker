"use client";

import { Inbox } from "lucide-react";
import Link from "next/link";

// Shown when there are no transactions to display
export default function EmptyState({ message, showAddButton = true }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4">
      <div className="w-16 h-16 rounded-2xl bg-muted flex items-center justify-center mb-4">
        <Inbox className="w-8 h-8 text-muted-foreground" />
      </div>
      <p className="text-muted-foreground text-center mb-4">
        {message || "No transactions yet."}
      </p>
      {showAddButton && (
        <Link
          href="/add"
          className="px-5 py-2.5 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:opacity-90 transition-opacity"
        >
          Add Your First Transaction
        </Link>
      )}
    </div>
  );
}
