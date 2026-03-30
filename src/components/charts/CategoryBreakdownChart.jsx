import {
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
} from "recharts";
import Card from "@/components/common/Card";
import { formatCurrency } from "@/utils/format";

function CustomTooltip({ active, payload }) {
  if (!active || !payload?.length) {
    return null;
  }

  const item = payload[0];

  return (
    <div className="rounded-2xl border border-white/30 bg-white/95 px-4 py-3 shadow-xl shadow-slate-950/15 dark:border-white/10 dark:bg-slate-950/95">
      <p className="text-sm font-semibold text-slate-950 dark:text-white">
        {item.name}
      </p>
      <p className="text-sm text-slate-500 dark:text-slate-400">
        {formatCurrency(item.value)}
      </p>
    </div>
  );
}

export default function CategoryBreakdownChart({
  data,
  monthLabel,
  title = "Category breakdown",
}) {
  return (
    <Card className="h-full">
      <div className="mb-4 flex items-start justify-between gap-4">
        <div>
          <h2 className="text-lg font-semibold text-slate-950 dark:text-white sm:text-xl">
            {title}
          </h2>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            Expense distribution for {monthLabel}.
          </p>
        </div>
      </div>

      {data.length === 0 ? (
        <div className="flex h-[280px] items-center justify-center rounded-xl border border-dashed border-emerald-200/80 bg-emerald-50/60 text-center dark:border-emerald-900/70 dark:bg-emerald-950/20 sm:h-[320px]">
          <div className="space-y-2 px-6">
            <p className="text-sm font-semibold text-slate-950 dark:text-white">
              No spending categories yet
            </p>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Once expenses land in this month, your category mix appears here.
            </p>
          </div>
        </div>
      ) : (
        <div
          role="img"
          aria-label={`Category breakdown chart for ${monthLabel}`}
          className="h-[280px] sm:h-[320px]"
        >
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                dataKey="value"
                innerRadius={72}
                outerRadius={104}
                paddingAngle={3}
              >
                {data.map((entry) => (
                  <Cell key={entry.name} fill={entry.fill} />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
              <Legend
                verticalAlign="bottom"
                height={36}
                formatter={(value) => (
                  <span className="text-sm text-slate-500 dark:text-slate-400">
                    {value}
                  </span>
                )}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
      )}
    </Card>
  );
}
