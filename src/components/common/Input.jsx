import { useId } from "react";
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
  optionalLabel,
  required = false,
  ariaDescribedBy,
  ...props
}) {
  const Component = as;
  const generatedId = useId();
  const fieldId = id || `field-${generatedId}`;
  const errorId = error ? `${fieldId}-error` : undefined;
  const hintId = !error && hint ? `${fieldId}-hint` : undefined;
  const describedBy = [ariaDescribedBy, errorId, hintId]
    .filter(Boolean)
    .join(" ")
    .trim();

  return (
    <label className={cn("flex flex-col gap-2", className)} htmlFor={fieldId}>
      {label ? (
        <span className="text-sm font-medium text-slate-700 dark:text-slate-200">
          {label}
          {optionalLabel ? (
            <span className="ml-1 text-xs font-medium text-slate-500 dark:text-slate-400">
              ({optionalLabel})
            </span>
          ) : null}
        </span>
      ) : null}
      <Component
        id={fieldId}
        required={required}
        aria-invalid={Boolean(error) || undefined}
        aria-describedby={describedBy || undefined}
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
        <span id={errorId} className="text-sm text-rose-700 dark:text-rose-300">
          {error}
        </span>
      ) : hint ? (
        <span id={hintId} className="text-sm text-slate-500 dark:text-slate-400">
          {hint}
        </span>
      ) : null}
    </label>
  );
}
