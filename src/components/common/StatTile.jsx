import Card from "@/components/common/Card";

export default function StatTile({
  caption,
  helper,
  value,
}) {
  return (
    <Card padding="p-4 sm:p-5">
      <p className="text-sm text-slate-500 dark:text-slate-400">{caption}</p>
      <p className="mt-2 text-2xl font-semibold text-slate-950 dark:text-white">{value}</p>
      {helper ? (
        <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">{helper}</p>
      ) : null}
    </Card>
  );
}

