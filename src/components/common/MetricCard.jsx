import Card from "@/components/common/Card";
import { cn } from "@/utils/cn";

export default function MetricCard({
  change,
  icon: Icon,
  label,
  tone = "emerald",
  value,
}) {
  const tones = {
    emerald:
      "bg-emerald-500/15 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-300",
    amber:
      "bg-amber-400/20 text-amber-700 dark:bg-amber-400/10 dark:text-amber-300",
    rose: "bg-rose-500/15 text-rose-700 dark:bg-rose-500/10 dark:text-rose-300",
    slate:
      "bg-slate-900/10 text-slate-700 dark:bg-slate-100/10 dark:text-slate-200",
  };

  return (
    <Card tone="highlight">
      <div className="flex items-start justify-between gap-4">
        <div className="space-y-3">
          <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
            {label}
          </p>
          <div className="text-3xl font-semibold tracking-tight text-slate-950 dark:text-white">
            {value}
          </div>
          {change ? (
            <p className="text-sm text-slate-500 dark:text-slate-400">{change}</p>
          ) : null}
        </div>
        {Icon ? (
          <div
            className={cn(
              "flex h-12 w-12 items-center justify-center rounded-2xl",
              tones[tone]
            )}
          >
            <Icon className="h-5 w-5" />
          </div>
        ) : null}
      </div>
    </Card>
  );
}
