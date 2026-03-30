import Card from "@/components/common/Card";
import { cn } from "@/utils/cn";

const tones = {
  info: "border-emerald-200/80 bg-emerald-50/70 text-emerald-900 dark:border-emerald-500/30 dark:bg-emerald-500/10 dark:text-emerald-200",
  success:
    "border-emerald-200/80 bg-emerald-50/70 text-emerald-900 dark:border-emerald-500/30 dark:bg-emerald-500/10 dark:text-emerald-200",
  warning:
    "border-amber-300/80 bg-amber-50/80 text-amber-900 dark:border-amber-500/30 dark:bg-amber-500/10 dark:text-amber-200",
  danger: "border-rose-300/80 bg-rose-50/80 text-rose-900 dark:border-rose-500/30 dark:bg-rose-500/10 dark:text-rose-200",
};

export default function StatusBanner({
  action,
  children,
  className,
  role,
  title,
  tone = "info",
}) {
  return (
    <Card
      className={cn("p-4", tones[tone] || tones.info, className)}
      role={role || (tone === "warning" || tone === "danger" ? "alert" : "status")}
      padding="p-4"
    >
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-1">
          {title ? <p className="font-semibold">{title}</p> : null}
          {children ? <div className="text-sm">{children}</div> : null}
        </div>
        {action ? <div className="shrink-0">{action}</div> : null}
      </div>
    </Card>
  );
}

