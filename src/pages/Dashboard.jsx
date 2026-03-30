import { useEffect, useState } from "react";
import {
  CircleDollarSign,
  PiggyBank,
  Plus,
  Target,
  TrendingDown,
  TrendingUp,
} from "lucide-react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import CategoryBreakdownChart from "@/components/charts/CategoryBreakdownChart";
import Button from "@/components/common/Button";
import Card from "@/components/common/Card";
import Loader from "@/components/common/Loader";
import MetricCard from "@/components/common/MetricCard";
import PageHeader from "@/components/common/PageHeader";
import StatTile from "@/components/common/StatTile";
import StatusBanner from "@/components/common/StatusBanner";
import RecentTransactions from "@/components/dashboard/RecentTransactions";
import { useAuthStore } from "@/state/useAuthStore";
import { useAppStore } from "@/state/useAppStore";
import {
  calculateTotals,
  filterTransactionsByMonth,
  getBudgetUsage,
  getCategoryBreakdown,
  getMonthKey,
  getRecentTransactions,
} from "@/utils/finance";
import { formatCurrency, formatMonthLabel } from "@/utils/format";

export default function Dashboard() {
  const location = useLocation();
  const navigate = useNavigate();
  const {
    guestDaysRemaining,
    hasPendingGuestMigration,
    isAuthLoading,
    isGuest,
    isGuestExpired,
    pendingGuestMigration,
    retryGuestMigration,
  } = useAuthStore();
  const { budgets, isReady, transactions } = useAppStore();
  const [migrationNotice, setMigrationNotice] = useState("");

  const currentMonth = getMonthKey();
  const monthlyTransactions = filterTransactionsByMonth(transactions, currentMonth);
  const monthlyTotals = calculateTotals(monthlyTransactions);
  const overallTotals = calculateTotals(transactions);
  const currentBudgets = budgets.filter((budget) => budget.month === currentMonth);
  const budgetsOnTrack = currentBudgets.filter(
    (budget) => !getBudgetUsage(budget, transactions).exceeded
  ).length;

  useEffect(() => {
    const migration = location.state?.migration;

    if (!migration?.ok) {
      return;
    }

    if (migration.alreadyMigrated) {
      setMigrationNotice("Guest data was already linked to this account.");
    } else {
      setMigrationNotice(
        `Migration complete: ${migration.migratedTransactions} transaction(s) and ${migration.migratedBudgets} budget(s) imported.`
      );
    }

    navigate(location.pathname, { replace: true, state: {} });
  }, [location.pathname, location.state, navigate]);

  async function handleRetryMigration() {
    const result = await retryGuestMigration();
    window.alert(result.message);
  }

  if (!isReady) {
    return <Loader />;
  }

  return (
    <div className="page-stack">
      <PageHeader
        eyebrow="Overview"
        title="Dashboard"
        description={`Snapshot for ${formatMonthLabel(currentMonth)}.`}
        actions={
          <div className="flex flex-wrap gap-2">
            <Link to="/transactions">
              <Button variant="outline">
                <Plus className="h-4 w-4" />
                Add transaction
              </Button>
            </Link>
            <Link to="/budgets">
              <Button>
                <Target className="h-4 w-4" />
                Manage budgets
              </Button>
            </Link>
          </div>
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <MetricCard
          icon={CircleDollarSign}
          label="Net balance"
          tone="emerald"
          value={formatCurrency(overallTotals.savings)}
          change="All-time income minus expenses"
        />
        <MetricCard
          icon={TrendingUp}
          label="Income this month"
          tone="amber"
          value={formatCurrency(monthlyTotals.income)}
          change="Recorded inflow"
        />
        <MetricCard
          icon={TrendingDown}
          label="Expenses this month"
          tone="rose"
          value={formatCurrency(monthlyTotals.expenses)}
          change="Recorded outflow"
        />
        <MetricCard
          icon={Target}
          label="Budgets on track"
          tone="slate"
          value={`${budgetsOnTrack}/${currentBudgets.length || 0}`}
          change="Within monthly limits"
        />
      </div>

      {migrationNotice ? (
        <StatusBanner tone="success" title="Migration update">
          {migrationNotice}
        </StatusBanner>
      ) : null}

      {hasPendingGuestMigration ? (
        <StatusBanner
          tone="warning"
          title="Migration recovery needed"
          action={
            <Button loading={isAuthLoading} onClick={handleRetryMigration}>
              Retry migration
            </Button>
          }
        >
          {pendingGuestMigration?.lastError || "A previous migration attempt did not complete."}
        </StatusBanner>
      ) : null}

      {isGuest ? (
        <StatusBanner
          tone={isGuestExpired ? "warning" : "info"}
          title={isGuestExpired ? "Guest mode is read-only" : "Guest mode is active"}
          action={
            <Link to="/auth/register">
              <Button>Create account</Button>
            </Link>
          }
        >
          {isGuestExpired
            ? "You can still view data, but edits are disabled until you create an account or log in."
            : `${guestDaysRemaining} day(s) remaining in guest editing mode.`}
        </StatusBanner>
      ) : null}

      <div className="grid gap-5 xl:grid-cols-[1.05fr_0.95fr]">
        <CategoryBreakdownChart
          data={getCategoryBreakdown(monthlyTransactions)}
          monthLabel={formatMonthLabel(currentMonth)}
          title="Expense mix"
        />
        <RecentTransactions transactions={getRecentTransactions(transactions)} />
      </div>

      <div className="grid gap-5 lg:grid-cols-[1fr_0.95fr]">
        <Card tone="highlight">
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/15 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-300">
                <PiggyBank className="h-5 w-5" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-slate-950 dark:text-white">Savings pulse</h2>
                <p className="section-subtitle">Track retained income quickly.</p>
              </div>
            </div>
            <div className="grid gap-3 sm:grid-cols-3">
              <StatTile caption="This month" value={formatCurrency(monthlyTotals.savings)} />
              <StatTile caption="All-time income" value={formatCurrency(overallTotals.income)} />
              <StatTile caption="All-time expenses" value={formatCurrency(overallTotals.expenses)} />
            </div>
          </div>
        </Card>

        <Card>
          <div className="space-y-3">
            <h2 className="text-lg font-semibold text-slate-950 dark:text-white">Budget watchlist</h2>
            {currentBudgets.length === 0 ? (
              <p className="section-subtitle">
                No budgets for {formatMonthLabel(currentMonth)} yet. Add one to track remaining spend.
              </p>
            ) : (
              currentBudgets.slice(0, 3).map((budget) => {
                const usage = getBudgetUsage(budget, transactions);
                return (
                  <div
                    key={budget.id}
                    className="rounded-xl border border-emerald-100/80 bg-white/70 p-4 dark:border-emerald-950/70 dark:bg-slate-950/60"
                  >
                    <div className="flex items-center justify-between gap-4">
                      <div>
                        <p className="font-semibold text-slate-950 dark:text-white">{budget.category}</p>
                        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                          {formatCurrency(usage.spent)} of {formatCurrency(budget.monthlyLimit)}
                        </p>
                      </div>
                      <p
                        className={`text-sm font-semibold ${
                          usage.exceeded
                            ? "text-rose-600 dark:text-rose-300"
                            : "text-emerald-700 dark:text-emerald-300"
                        }`}
                      >
                        {formatCurrency(usage.remaining)} left
                      </p>
                    </div>
                    <div className="mt-3 h-2 overflow-hidden rounded-full bg-emerald-100 dark:bg-emerald-950/60">
                      <div
                        className={`h-full rounded-full ${usage.exceeded ? "bg-rose-500" : "bg-emerald-500"}`}
                        style={{ width: `${usage.exceeded ? 100 : usage.progress}%` }}
                      />
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </Card>
      </div>
    </div>
  );
}

