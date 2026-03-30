import { cn } from "@/utils/cn";

export default function PageHeader({
  actions,
  eyebrow,
  description,
  titleId,
  title,
  className,
}) {
  return (
    <div
      className={cn(
        "flex flex-col gap-3 sm:gap-4 lg:flex-row lg:items-end lg:justify-between",
        className
      )}
    >
      <div className="space-y-1.5">
        {eyebrow ? (
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-amber-600 dark:text-amber-300">
            {eyebrow}
          </p>
        ) : null}
        <div className="space-y-1">
          <h1
            id={titleId}
            className="text-2xl font-semibold tracking-tight text-slate-950 dark:text-white sm:text-3xl"
          >
            {title}
          </h1>
          {description ? (
            <p className="max-w-2xl text-sm leading-6 text-slate-500 dark:text-slate-400">
              {description}
            </p>
          ) : null}
        </div>
      </div>
      {actions ? <div className="flex flex-wrap gap-2 sm:gap-3">{actions}</div> : null}
    </div>
  );
}
