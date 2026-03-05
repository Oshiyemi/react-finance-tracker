import { useState } from "react";
import {
  Landmark,
  PiggyBank,
  PieChart as PieChartIcon,
  TrendingDown,
  TrendingUp,
} from "lucide-react";
import CategoryBreakdownChart from "@/components/charts/CategoryBreakdownChart";
import ExpenseTrendChart from "@/components/charts/ExpenseTrendChart";
import Loader from "@/components/common/Loader";
import MetricCard from "@/components/common/MetricCard";
import PageHeader from "@/components/common/PageHeader";
import { useAppStore } from "@/state/useAppStore";
import {
  calculateTotals,
  filterTransactionsByMonth,
  getCategoryBreakdown,
  getExpenseTrend,
  getMonthKey,
  getMonthOptions,
  getTopSpendingCategory,
} from "@/utils/finance";
import { formatCurrency, formatMonthLabel, formatPercent } from "@/utils/format";

export default function Analytics() {
  const { isReady, transactions } = useAppStore();
  const [selectedMonth, setSelectedMonth] = useState(getMonthKey());

  if (!isReady) {
    return <Loader label="Preparing analytics..." />;
  }

  const monthTransactions = filterTransactionsByMonth(transactions, selectedMonth);
  const totals = calculateTotals(monthTransactions);
  const topCategory = getTopSpendingCategory(monthTransactions);
  const savingsRate = totals.income > 0 ? totals.savings / totals.income : 0;
  const monthLabel = formatMonthLabel(selectedMonth);

  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="Monthly review"
        title="Analytics"
        description="Review the last 12 months, compare income against expenses, and spot your top spending category."
        actions={
          <select
            className="field-shell h-11 min-w-[12rem]"
            value={selectedMonth}
            onChange={(event) => setSelectedMonth(event.target.value)}
          >
            {getMonthOptions(12).map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        }
      />

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
        <MetricCard
          icon={TrendingUp}
          label="Total income"
          tone="emerald"
          value={formatCurrency(totals.income)}
          change={`Income recorded in ${monthLabel}.`}
        />
        <MetricCard
          icon={TrendingDown}
          label="Total expenses"
          tone="rose"
          value={formatCurrency(totals.expenses)}
          change={`Expenses recorded in ${monthLabel}.`}
        />
        <MetricCard
          icon={PiggyBank}
          label="Savings"
          tone="amber"
          value={formatCurrency(totals.savings)}
          change="Income minus expenses for the selected month."
        />
        <MetricCard
          icon={Landmark}
          label="Savings rate"
          tone="slate"
          value={formatPercent(savingsRate)}
          change="Safe at 0% when there is no income in the selected month."
        />
        <MetricCard
          icon={PieChartIcon}
          label="Top spending category"
          tone="amber"
          value={topCategory.category}
          change={formatCurrency(topCategory.amount)}
        />
      </div>

      <div className="grid gap-6 xl:grid-cols-[1fr_1.1fr]">
        <CategoryBreakdownChart
          data={getCategoryBreakdown(monthTransactions)}
          monthLabel={monthLabel}
        />
        <ExpenseTrendChart data={getExpenseTrend(transactions, selectedMonth)} />
      </div>
    </div>
  );
}
