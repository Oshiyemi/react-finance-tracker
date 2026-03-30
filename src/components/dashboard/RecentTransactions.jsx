import { ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import Card from "@/components/common/Card";
import { formatCurrency, formatTransactionDate } from "@/utils/format";

export default function RecentTransactions({ transactions }) {
  return (
    <Card className="h-full">
      <div className="mb-4 flex items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-semibold text-slate-950 dark:text-white sm:text-xl">
            Recent transactions
          </h2>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            Latest money movement in your workspace.
          </p>
        </div>
        <Link
          className="inline-flex items-center gap-2 text-sm font-semibold text-emerald-700 transition hover:text-emerald-800 dark:text-emerald-300 dark:hover:text-emerald-200"
          to="/transactions"
        >
          View all
          <ArrowRight className="h-4 w-4" />
        </Link>
      </div>

      {transactions.length === 0 ? (
        <div className="rounded-xl border border-dashed border-emerald-200/80 bg-emerald-50/60 px-5 py-8 text-center dark:border-emerald-900/70 dark:bg-emerald-950/20">
          <p className="text-sm font-semibold text-slate-950 dark:text-white">No transactions yet</p>
          <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
            Add your first transaction to start filling this section.
          </p>
        </div>
      ) : (
        <div className="space-y-3" role="list" aria-label="Recent transactions">
          {transactions.map((transaction) => (
            <div
              key={transaction.id}
              role="listitem"
              className="flex flex-col gap-3 rounded-xl border border-emerald-100/80 bg-white/60 px-4 py-4 transition hover:border-emerald-200 hover:bg-white dark:border-emerald-950/70 dark:bg-slate-950/50 dark:hover:border-emerald-900"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0">
                  <p className="truncate font-semibold text-slate-950 dark:text-white">{transaction.title}</p>
                  <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                    {transaction.category} - {formatTransactionDate(transaction.date)}
                  </p>
                </div>
                <p
                  className={`text-sm font-semibold ${
                    transaction.type === "income"
                      ? "text-emerald-700 dark:text-emerald-300"
                      : "text-rose-600 dark:text-rose-300"
                  }`}
                >
                  {transaction.type === "income" ? "+" : "-"}
                  {formatCurrency(transaction.amount)}
                </p>
              </div>
              {transaction.notes ? (
                <p className="break-words text-sm text-slate-500 dark:text-slate-400">
                  {transaction.notes}
                </p>
              ) : null}
            </div>
          ))}
        </div>
      )}
    </Card>
  );
}

