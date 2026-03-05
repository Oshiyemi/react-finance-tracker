import { cn } from "@/utils/cn";

export default function Input({
  as = "input",
  children,
  className,
  error,
  hint,
  id,
  inputClassName,
  label,
  ...props
}) {
  const Component = as;

  return (
    <label className={cn("flex flex-col gap-2", className)} htmlFor={id}>
      {label ? (
        <span className="text-sm font-medium text-slate-700 dark:text-slate-200">
          {label}
        </span>
      ) : null}
      <Component
        id={id}
        className={cn(
          "field-shell",
          error &&
            "border-rose-300 text-rose-950 focus:border-rose-400 focus:ring-rose-200 dark:border-rose-800 dark:text-rose-100 dark:focus:border-rose-700 dark:focus:ring-rose-900/70",
          inputClassName
        )}
        {...props}
      >
        {children}
      </Component>
      {error ? (
        <span className="text-sm text-rose-600 dark:text-rose-300">{error}</span>
      ) : hint ? (
        <span className="text-sm text-slate-500 dark:text-slate-400">{hint}</span>
      ) : null}
    </label>
  );
}
