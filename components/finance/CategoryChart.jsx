"use client";

import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  Legend,
} from "recharts";
import { CATEGORY_COLORS } from "@/context/FinanceContext";

// A pie chart showing expenses broken down by category
export default function CategoryChart({ transactions }) {
  // Filter only expenses and group them by category
  const expenses = transactions.filter((t) => t.type === "expense");

  // Build data for the chart: sum amounts by category
  const categoryTotals = {};
  expenses.forEach((t) => {
    if (categoryTotals[t.category]) {
      categoryTotals[t.category] += Number(t.amount);
    } else {
      categoryTotals[t.category] = Number(t.amount);
    }
  });

  // Convert to array format that Recharts expects
  const chartData = Object.entries(categoryTotals).map(([name, value]) => ({
    name,
    value: Math.round(value * 100) / 100,
  }));

  // If no expense data, show a placeholder message
  if (chartData.length === 0) {
    return (
      <div className="bg-card rounded-xl border border-border p-6 shadow-sm">
        <h3 className="text-base font-semibold text-foreground mb-4">
          Expenses by Category
        </h3>
        <div className="flex items-center justify-center h-48">
          <p className="text-muted-foreground text-sm">
            No expense data to display yet.
          </p>
        </div>
      </div>
    );
  }

  // Custom tooltip that shows category and amount
  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-card border border-border rounded-lg p-3 shadow-lg">
          <p className="text-sm font-medium text-foreground">
            {payload[0].name}
          </p>
          <p className="text-sm text-muted-foreground">
            $
            {payload[0].value.toLocaleString("en-US", {
              minimumFractionDigits: 2,
            })}
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="bg-card rounded-xl border border-border p-6 shadow-sm">
      <h3 className="text-base font-semibold text-foreground mb-4">
        Expenses by Category
      </h3>
      <ResponsiveContainer width="100%" height={280}>
        <PieChart>
          <Pie
            data={chartData}
            cx="50%"
            cy="50%"
            innerRadius={60}
            outerRadius={100}
            paddingAngle={3}
            dataKey="value"
          >
            {chartData.map((entry, index) => (
              <Cell
                key={`cell-${index}`}
                fill={CATEGORY_COLORS[entry.name] || "#94a3b8"}
                stroke="none"
              />
            ))}
          </Pie>
          <Tooltip content={<CustomTooltip />} />
          <Legend
            verticalAlign="bottom"
            height={36}
            formatter={(value) => (
              <span className="text-xs text-muted-foreground">{value}</span>
            )}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}
