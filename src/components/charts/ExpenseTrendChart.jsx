import {
  Bar,
  CartesianGrid,
  ComposedChart,
  Line,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import Card from "@/components/common/Card";
import { formatCurrency } from "@/utils/format";

function TrendTooltip({ active, payload, label }) {
  if (!active || !payload?.length) {
    return null;
  }

  const expensePoint = payload.find((item) => item.dataKey === "expenses");
  const incomePoint = payload.find((item) => item.dataKey === "income");

  return (
    <div className="rounded-2xl border border-white/30 bg-white/95 px-4 py-3 shadow-xl shadow-slate-950/15 dark:border-white/10 dark:bg-slate-950/95">
      <p className="text-sm font-semibold text-slate-950 dark:text-white">{label}</p>
      <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
        Expenses: {formatCurrency(expensePoint?.value || 0)}
      </p>
      <p className="text-sm text-slate-500 dark:text-slate-400">
        Income: {formatCurrency(incomePoint?.value || 0)}
      </p>
    </div>
  );
}

export default function ExpenseTrendChart({ data }) {
  return (
    <Card className="h-full">
      <div className="mb-4">
        <h2 className="text-lg font-semibold text-slate-950 dark:text-white sm:text-xl">
          Expense trend
        </h2>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
          Six-month trend ending with your selected month.
        </p>
      </div>

      {data.length === 0 ? (
        <div className="flex h-[280px] items-center justify-center rounded-xl border border-dashed border-emerald-200/80 bg-emerald-50/60 text-center dark:border-emerald-900/70 dark:bg-emerald-950/20 sm:h-[320px]">
          <div className="space-y-2 px-6">
            <p className="text-sm font-semibold text-slate-950 dark:text-white">
              Not enough history yet
            </p>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Add transactions across a few months to reveal the trend line.
            </p>
          </div>
        </div>
      ) : (
        <div
          role="img"
          aria-label="Six-month expense and income trend chart"
          className="h-[280px] sm:h-[320px]"
        >
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={data} margin={{ left: -12, right: 12 }}>
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="rgba(148, 163, 184, 0.25)"
                vertical={false}
              />
              <XAxis
                dataKey="label"
                tickLine={false}
                axisLine={false}
                tick={{ fill: "#64748b", fontSize: 12 }}
              />
              <YAxis
                tickFormatter={(value) => `$${Number(value).toLocaleString()}`}
                tickLine={false}
                axisLine={false}
                tick={{ fill: "#64748b", fontSize: 12 }}
              />
              <Tooltip content={<TrendTooltip />} />
              <Bar
                dataKey="expenses"
                fill="#10b981"
                radius={[10, 10, 0, 0]}
                barSize={24}
              />
              <Line
                type="monotone"
                dataKey="income"
                stroke="#f59e0b"
                strokeWidth={2.5}
                dot={{ fill: "#f59e0b", strokeWidth: 0, r: 4 }}
              />
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      )}
    </Card>
  );
}
