import { Sparkles } from "lucide-react";
import Button from "@/components/common/Button";
import Card from "@/components/common/Card";

export default function EmptyState({
  action,
  actionDisabled = false,
  actionHint,
  actionLabel,
  eyebrow = "Nothing here yet",
  message,
  title,
}) {
  return (
    <Card className="border-dashed text-center" padding="p-10" tone="highlight">
      <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-500/15 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-300">
        <Sparkles className="h-6 w-6" />
      </div>
      <p className="mt-5 text-xs font-semibold uppercase tracking-[0.24em] text-amber-600 dark:text-amber-300">
        {eyebrow}
      </p>
      <h3 className="mt-3 text-2xl font-semibold text-slate-950 dark:text-white">
        {title}
      </h3>
      <p className="mx-auto mt-3 max-w-xl text-sm leading-6 text-slate-500 dark:text-slate-400">
        {message}
      </p>
      {action && actionLabel ? (
        <div className="mt-6">
          <Button disabled={actionDisabled} onClick={action} title={actionHint}>
            {actionLabel}
          </Button>
          {actionDisabled && actionHint ? (
            <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">{actionHint}</p>
          ) : null}
        </div>
      ) : null}
    </Card>
  );
}
