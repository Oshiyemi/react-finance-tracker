import { ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import Card from "@/components/common/Card";
import { formatCurrency, formatTransactionDate } from "@/utils/format";

export default function RecentTransactions({ transactions }) {
  return (
    <Card className="h-full">
      <div className="mb-6 flex items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-semibold text-slate-950 dark:text-white">
            Recent flow
          </h2>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            Your latest money movements, sorted by date.
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
        <div className="rounded-[1.75rem] border border-dashed border-emerald-200/80 bg-emerald-50/60 px-5 py-10 text-center dark:border-emerald-900/70 dark:bg-emerald-950/20">
          <p className="text-sm font-semibold text-slate-950 dark:text-white">
            No transactions yet
          </p>
          <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
            Add your first income or expense to start shaping the dashboard.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {transactions.map((transaction) => (
            <div
              key={transaction.id}
              className="flex flex-col gap-3 rounded-[1.5rem] border border-emerald-100/80 bg-white/60 px-4 py-4 transition hover:border-emerald-200 hover:bg-white dark:border-emerald-950/70 dark:bg-slate-950/50 dark:hover:border-emerald-900"
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="font-semibold text-slate-950 dark:text-white">
                    {transaction.title}
                  </p>
                  <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                    {transaction.category} • {formatTransactionDate(transaction.date)}
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
                <p className="text-sm text-slate-500 dark:text-slate-400">
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
