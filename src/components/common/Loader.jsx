export default function Loader({ label = "Loading your workspace..." }) {
  return (
    <div
      role="status"
      aria-live="polite"
      className="flex min-h-[35vh] flex-col items-center justify-center gap-4 text-center"
    >
      <div
        aria-hidden="true"
        className="h-10 w-10 animate-spin rounded-full border-4 border-emerald-200 border-t-emerald-600 dark:border-emerald-950 dark:border-t-emerald-400"
      />
      <div className="space-y-1">
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-amber-600 dark:text-amber-300">
          FinTrack Wealth
        </p>
        <p className="text-sm text-slate-500 dark:text-slate-400">{label}</p>
      </div>
    </div>
  );
}
