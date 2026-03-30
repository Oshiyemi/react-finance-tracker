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
import StatusBanner from "@/components/common/StatusBanner";
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
    <div className="page-stack">
      <PageHeader
        eyebrow="Analytics"
        title="Monthly insights"
        description="Review totals, category mix, and six-month trends."
        actions={
          <select
            aria-label="Select month"
            className="field-shell h-10 min-w-[12rem]"
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

      {monthTransactions.length === 0 ? (
        <StatusBanner tone="warning" title="No transactions in this month">
          Add transactions for {monthLabel} to unlock complete analytics.
        </StatusBanner>
      ) : null}

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
        <MetricCard
          icon={TrendingUp}
          label="Income"
          tone="emerald"
          value={formatCurrency(totals.income)}
          change={monthLabel}
        />
        <MetricCard
          icon={TrendingDown}
          label="Expenses"
          tone="rose"
          value={formatCurrency(totals.expenses)}
          change={monthLabel}
        />
        <MetricCard
          icon={PiggyBank}
          label="Savings"
          tone="amber"
          value={formatCurrency(totals.savings)}
          change="Income minus expenses"
        />
        <MetricCard
          icon={Landmark}
          label="Savings rate"
          tone="slate"
          value={formatPercent(savingsRate)}
          change="0% if no income"
        />
        <MetricCard
          icon={PieChartIcon}
          label="Top spend category"
          tone="amber"
          value={topCategory.category}
          change={formatCurrency(topCategory.amount)}
        />
      </div>

      <div className="grid gap-5 xl:grid-cols-[1fr_1.1fr]">
        <CategoryBreakdownChart
          data={getCategoryBreakdown(monthTransactions)}
          monthLabel={monthLabel}
          title="Category breakdown"
        />
        <ExpenseTrendChart data={getExpenseTrend(transactions, selectedMonth)} />
      </div>
    </div>
  );
}

