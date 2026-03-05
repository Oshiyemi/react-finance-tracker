import { useEffect, useState } from "react";
import {
  CircleDollarSign,
  PiggyBank,
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
        `Migration complete: ${migration.migratedTransactions} transaction(s) and ${migration.migratedBudgets} budget(s) moved into your account.`
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
    <div className="space-y-8">
      <PageHeader
        eyebrow="Financial command center"
        title="See the month before it sees you."
        description={`Your ${formatMonthLabel(
          currentMonth
        )} position, current momentum, and the next pressure points on one page.`}
        actions={
          isGuest ? (
            <Link to="/auth/register">
              <Button>Create account</Button>
            </Link>
          ) : null
        }
      />

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <MetricCard
          icon={CircleDollarSign}
          label="Net balance"
          tone="emerald"
          value={formatCurrency(overallTotals.savings)}
          change="All recorded income minus all recorded expenses."
        />
        <MetricCard
          icon={TrendingUp}
          label="Income this month"
          tone="amber"
          value={formatCurrency(monthlyTotals.income)}
          change="Cash inflow recorded in the selected month."
        />
        <MetricCard
          icon={TrendingDown}
          label="Expenses this month"
          tone="rose"
          value={formatCurrency(monthlyTotals.expenses)}
          change="Outflows for the current month."
        />
        <MetricCard
          icon={Target}
          label="Budgets on track"
          tone="slate"
          value={`${budgetsOnTrack}/${currentBudgets.length || 0}`}
          change="Budget categories currently within their monthly limit."
        />
      </div>

      {migrationNotice ? (
        <Card className="border-emerald-200/80 bg-emerald-50/70 dark:border-emerald-500/30 dark:bg-emerald-500/10">
          <p className="text-sm font-medium text-emerald-900 dark:text-emerald-200">
            {migrationNotice}
          </p>
        </Card>
      ) : null}

      {hasPendingGuestMigration ? (
        <Card className="border-amber-300/80 bg-amber-50/80 dark:border-amber-500/30 dark:bg-amber-500/10">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-amber-700 dark:text-amber-300">
                Migration recovery
              </p>
              <h2 className="mt-2 text-xl font-semibold text-slate-950 dark:text-white">
                We still need to finish moving your guest data.
              </h2>
              <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">
                {pendingGuestMigration?.lastError || "A previous attempt did not complete."}
              </p>
            </div>
            <Button loading={isAuthLoading} onClick={handleRetryMigration}>
              Retry migration
            </Button>
          </div>
        </Card>
      ) : null}

      {isGuest ? (
        <Card tone="highlight">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-amber-600 dark:text-amber-300">
                Guest mode
              </p>
              <h2 className="mt-2 text-2xl font-semibold text-slate-950 dark:text-white">
                You are exploring in a local-only guest workspace.
              </h2>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500 dark:text-slate-400">
                {isGuestExpired
                  ? "Guest access ended. You can still view data, but edits are disabled until you create an account or log in."
                  : `Your data is stored in browser localStorage under a guest namespace. ${guestDaysRemaining} day(s) remain in your guest trial.`}
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              <Link to="/auth/register">
                <Button>Create account</Button>
              </Link>
              <Link to="/settings">
                <Button variant="outline">View storage details</Button>
              </Link>
            </div>
          </div>
        </Card>
      ) : null}

      <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
        <CategoryBreakdownChart
          data={getCategoryBreakdown(monthlyTransactions)}
          monthLabel={formatMonthLabel(currentMonth)}
          title="Current month spend mix"
        />
        <RecentTransactions transactions={getRecentTransactions(transactions)} />
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_0.9fr]">
        <Card tone="highlight">
          <div className="space-y-5">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-500/15 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-300">
                <PiggyBank className="h-5 w-5" />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-slate-950 dark:text-white">
                  Savings pulse
                </h2>
                <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                  Track how much income survives your current spending pattern.
                </p>
              </div>
            </div>
            <div className="grid gap-4 sm:grid-cols-3">
              <div className="rounded-[1.5rem] bg-white/70 p-4 dark:bg-slate-950/60">
                <p className="text-sm text-slate-500 dark:text-slate-400">This month</p>
                <p className="mt-2 text-2xl font-semibold text-slate-950 dark:text-white">
                  {formatCurrency(monthlyTotals.savings)}
                </p>
              </div>
              <div className="rounded-[1.5rem] bg-white/70 p-4 dark:bg-slate-950/60">
                <p className="text-sm text-slate-500 dark:text-slate-400">All time income</p>
                <p className="mt-2 text-2xl font-semibold text-slate-950 dark:text-white">
                  {formatCurrency(overallTotals.income)}
                </p>
              </div>
              <div className="rounded-[1.5rem] bg-white/70 p-4 dark:bg-slate-950/60">
                <p className="text-sm text-slate-500 dark:text-slate-400">All time expenses</p>
                <p className="mt-2 text-2xl font-semibold text-slate-950 dark:text-white">
                  {formatCurrency(overallTotals.expenses)}
                </p>
              </div>
            </div>
          </div>
        </Card>

        <Card>
          <div className="space-y-4">
            <h2 className="text-xl font-semibold text-slate-950 dark:text-white">
              Budget watchlist
            </h2>
            {currentBudgets.length === 0 ? (
              <p className="text-sm leading-6 text-slate-500 dark:text-slate-400">
                No budgets yet for {formatMonthLabel(currentMonth)}. Add one from the
                budget page to start tracking remaining spend by category.
              </p>
            ) : (
              currentBudgets.slice(0, 3).map((budget) => {
                const usage = getBudgetUsage(budget, transactions);
                return (
                  <div
                    key={budget.id}
                    className="rounded-[1.5rem] border border-emerald-100/80 bg-white/70 p-4 dark:border-emerald-950/70 dark:bg-slate-950/60"
                  >
                    <div className="flex items-center justify-between gap-4">
                      <div>
                        <p className="font-semibold text-slate-950 dark:text-white">
                          {budget.category}
                        </p>
                        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                          {formatCurrency(usage.spent)} spent of{" "}
                          {formatCurrency(budget.monthlyLimit)}
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
                        className={`h-full rounded-full ${
                          usage.exceeded ? "bg-rose-500" : "bg-emerald-500"
                        }`}
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
