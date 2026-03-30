import { ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";

export default function AuthFrame({
  backLabel = "Back",
  backTo,
  children,
  description,
  title,
}) {
  return (
    <div className="relative flex min-h-[calc(100dvh-4.5rem)] items-center overflow-hidden px-4 py-3 sm:py-4">
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute left-[-8rem] top-[-7rem] h-[22rem] w-[22rem] rounded-full bg-emerald-400/20 blur-3xl dark:bg-emerald-500/10" />
        <div className="absolute bottom-[-6rem] right-[-3rem] h-[20rem] w-[20rem] rounded-full bg-amber-300/20 blur-3xl dark:bg-amber-400/10" />
      </div>

      {backTo ? (
        <Link
          to={backTo}
          aria-label={backLabel}
          className="group absolute left-4 top-2 z-20 inline-flex items-center gap-1.5 rounded-lg px-2 py-1.5 text-sm font-semibold text-slate-600 transition-all duration-200 hover:bg-white/70 hover:text-slate-900 hover:shadow-sm dark:text-slate-300 dark:hover:bg-slate-900/80 dark:hover:text-slate-100 sm:top-3"
        >
          <ArrowLeft className="h-4 w-4 transition-transform duration-200 group-hover:-translate-x-0.5" />
          <span>{backLabel}</span>
        </Link>
      ) : null}

      <div className="mx-auto w-full max-w-6xl">
        <div className="grid w-full items-start gap-4 lg:grid-cols-[0.95fr_1.05fr] lg:gap-6">
          <section className="max-w-xl space-y-4 self-start">
            <h1 className="text-[1.85rem] font-semibold leading-[1.08] text-slate-950 dark:text-white sm:text-[2.5rem] lg:text-[2.75rem]">
              {title}
            </h1>
            <p className="max-w-lg text-[1rem] leading-6 text-slate-600 dark:text-slate-300 sm:text-[1.1rem] sm:leading-7">
              {description}
            </p>
          </section>

          <section className="surface-card mx-auto w-full max-w-xl self-start p-6 sm:p-6">
            {children}
          </section>
        </div>
      </div>
    </div>
  );
}
