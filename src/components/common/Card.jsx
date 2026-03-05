import { cn } from "@/utils/cn";

export default function Card({
  children,
  className,
  padding = "p-6",
  tone = "default",
}) {
  return (
    <div
      className={cn(
        "surface-card",
        padding,
        tone === "highlight" &&
          "border-emerald-200/80 bg-gradient-to-br from-white/90 via-emerald-50/70 to-amber-50/90 dark:border-emerald-900/70 dark:from-slate-950/90 dark:via-emerald-950/50 dark:to-amber-950/30",
        className
      )}
    >
      {children}
    </div>
  );
}
