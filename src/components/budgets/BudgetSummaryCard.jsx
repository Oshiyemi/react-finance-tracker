import { PencilLine, TriangleAlert, Trash2 } from "lucide-react";
import Button from "@/components/common/Button";
import Card from "@/components/common/Card";
import { formatCurrency, formatMonthLabel } from "@/utils/format";

export default function BudgetSummaryCard({
  budget,
  disabled = false,
  disabledMessage = "",
  onDelete,
  onEdit,
  usage,
}) {
  return (
    <Card
      className={
        usage.exceeded
          ? "border-rose-200/90 dark:border-rose-900/60"
          : "border-emerald-100/80 dark:border-emerald-950/70"
      }
      tone="highlight"
    >
      <div className="flex flex-col gap-5">
        <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-xl font-semibold text-slate-950 dark:text-white">
                {budget.category}
              </h3>
              {usage.exceeded ? (
                <span className="inline-flex items-center gap-1 rounded-full bg-rose-500/15 px-3 py-1 text-xs font-semibold text-rose-700 dark:bg-rose-500/10 dark:text-rose-300">
                  <TriangleAlert className="h-3.5 w-3.5" />
                  Over budget
                </span>
              ) : null}
            </div>
            <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
              {formatMonthLabel(budget.month)} budget
            </p>
            {budget.notes ? (
              <p className="mt-3 text-sm text-slate-500 dark:text-slate-400">
                {budget.notes}
              </p>
            ) : null}
          </div>
          <div className="flex gap-2">
            <Button
              size="sm"
              variant="outline"
              disabled={disabled}
              title={disabled ? disabledMessage : "Edit budget"}
              onClick={() => onEdit(budget)}
            >
              <PencilLine className="h-4 w-4" />
              Edit
            </Button>
            <Button
              size="sm"
              variant="destructive"
              disabled={disabled}
              title={disabled ? disabledMessage : "Delete budget"}
              onClick={() => onDelete(budget.id)}
            >
              <Trash2 className="h-4 w-4" />
              Delete
            </Button>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          <div className="rounded-[1.5rem] bg-white/70 p-4 dark:bg-slate-950/60">
            <p className="text-sm text-slate-500 dark:text-slate-400">Monthly limit</p>
            <p className="mt-2 text-2xl font-semibold text-slate-950 dark:text-white">
              {formatCurrency(budget.monthlyLimit)}
            </p>
          </div>
          <div className="rounded-[1.5rem] bg-white/70 p-4 dark:bg-slate-950/60">
            <p className="text-sm text-slate-500 dark:text-slate-400">Spent this month</p>
            <p className="mt-2 text-2xl font-semibold text-slate-950 dark:text-white">
              {formatCurrency(usage.spent)}
            </p>
          </div>
          <div className="rounded-[1.5rem] bg-white/70 p-4 dark:bg-slate-950/60">
            <p className="text-sm text-slate-500 dark:text-slate-400">Remaining</p>
            <p
              className={`mt-2 text-2xl font-semibold ${
                usage.remaining < 0
                  ? "text-rose-600 dark:text-rose-300"
                  : "text-emerald-700 dark:text-emerald-300"
              }`}
            >
              {formatCurrency(usage.remaining)}
            </p>
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-slate-500 dark:text-slate-400">Progress</span>
            <span className="font-semibold text-slate-950 dark:text-white">
              {Math.round(
                usage.exceeded ? (usage.spent / budget.monthlyLimit) * 100 : usage.progress
              )}
              %
            </span>
          </div>
          <div className="h-3 overflow-hidden rounded-full bg-emerald-100 dark:bg-emerald-950/60">
            <div
              className={`h-full rounded-full transition-all ${
                usage.exceeded ? "bg-rose-500" : "bg-emerald-500"
              }`}
              style={{ width: `${usage.exceeded ? 100 : usage.progress}%` }}
            />
          </div>
        </div>
      </div>
    </Card>
  );
}
