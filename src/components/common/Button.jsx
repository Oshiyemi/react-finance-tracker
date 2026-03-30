import { LoaderCircle } from "lucide-react";
import { cn } from "@/utils/cn";

const variants = {
  primary:
    "bg-emerald-600 text-white shadow-lg shadow-emerald-900/20 hover:bg-emerald-500 dark:bg-emerald-500 dark:hover:bg-emerald-400",
  outline:
    "border border-emerald-200/80 bg-white/85 text-slate-800 shadow-sm hover:border-emerald-300 hover:bg-white dark:border-emerald-900/70 dark:bg-slate-950/75 dark:text-slate-100 dark:hover:border-emerald-800 dark:hover:bg-slate-950",
  ghost:
    "bg-transparent text-slate-700 hover:bg-emerald-50 hover:text-slate-950 dark:text-slate-200 dark:hover:bg-slate-900/70 dark:hover:text-white",
  destructive:
    "border border-rose-200/80 bg-rose-50/80 text-rose-600 shadow-sm hover:border-rose-300 hover:bg-rose-100/80 hover:text-rose-700 dark:border-rose-900/60 dark:bg-rose-950/25 dark:text-rose-300 dark:hover:border-rose-800 dark:hover:bg-rose-950/40 dark:hover:text-rose-200",
  accent:
    "bg-amber-400 text-slate-950 shadow-lg shadow-amber-900/20 hover:bg-amber-300 dark:bg-amber-300 dark:hover:bg-amber-200",
};

const sizes = {
  sm: "px-3 py-1.5 text-sm",
  md: "px-3.5 py-2 text-sm",
  lg: "px-4 py-2.5 text-sm",
  icon: "h-10 w-10 p-0",
};

export default function Button({
  children,
  className,
  loading = false,
  variant = "primary",
  size = "md",
  type = "button",
  ...props
}) {
  return (
    <button
      type={type}
      className={cn(
        "inline-flex min-w-0 items-center justify-center gap-2 whitespace-nowrap rounded-lg font-semibold leading-none transition-all duration-200 [&>svg]:shrink-0 [&>svg]:align-middle focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400 focus-visible:ring-offset-2 focus-visible:ring-offset-transparent disabled:cursor-not-allowed disabled:opacity-60",
        variants[variant] || variants.primary,
        sizes[size],
        className
      )}
      aria-busy={loading || undefined}
      disabled={loading || props.disabled}
      {...props}
    >
      {loading ? (
        <>
          <LoaderCircle className="h-4 w-4 animate-spin" />
          <span className="sr-only">Loading</span>
        </>
      ) : null}
      {children}
    </button>
  );
}
