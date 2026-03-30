import { PencilLine, Trash2 } from "lucide-react";
import Button from "@/components/common/Button";
import Card from "@/components/common/Card";
import { formatCurrency, formatTransactionDate } from "@/utils/format";

export default function TransactionTable({
  disabled = false,
  disabledMessage = "",
  onDelete,
  onEdit,
  transactions,
}) {
  return (
    <Card>
      <div className="space-y-3" role="list" aria-label="Transactions">
        {transactions.map((transaction) => (
          <div
            key={transaction.id}
            role="listitem"
            className="flex flex-col gap-4 rounded-xl border border-emerald-100/80 bg-white/60 p-4 transition hover:border-emerald-200 hover:bg-white dark:border-emerald-950/70 dark:bg-slate-950/50 dark:hover:border-emerald-900 md:flex-row md:items-center md:justify-between"
          >
            <div className="space-y-2">
              <div className="flex flex-wrap items-center gap-2">
                <p className="font-semibold text-slate-950 dark:text-white">
                  {transaction.title}
                </p>
                <span
                  className={`rounded-full px-3 py-1 text-xs font-semibold ${
                    transaction.type === "income"
                      ? "bg-emerald-500/15 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-300"
                      : "bg-rose-500/15 text-rose-700 dark:bg-rose-500/10 dark:text-rose-300"
                  }`}
                >
                  {transaction.type}
                </span>
              </div>
              <div className="flex flex-wrap gap-x-4 gap-y-1 break-words text-sm text-slate-500 dark:text-slate-400">
                <span>{transaction.category}</span>
                <span>{formatTransactionDate(transaction.date)}</span>
                {transaction.notes ? <span>{transaction.notes}</span> : null}
              </div>
            </div>

            <div className="flex flex-col gap-3 md:items-end">
              <p
                className={`text-lg font-semibold ${
                  transaction.type === "income"
                    ? "text-emerald-700 dark:text-emerald-300"
                    : "text-rose-600 dark:text-rose-300"
                }`}
              >
                {transaction.type === "income" ? "+" : "-"}
                {formatCurrency(transaction.amount)}
              </p>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={disabled}
                  aria-label={`Edit ${transaction.title}`}
                  title={disabled ? disabledMessage : "Edit transaction"}
                  onClick={() => onEdit(transaction)}
                >
                  <PencilLine className="h-4 w-4" />
                  Edit
                </Button>
                <Button
                  variant="destructive"
                  size="sm"
                  disabled={disabled}
                  aria-label={`Delete ${transaction.title}`}
                  title={disabled ? disabledMessage : "Delete transaction"}
                  onClick={() => onDelete(transaction.id)}
                >
                  <Trash2 className="h-4 w-4" />
                  Delete
                </Button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}
