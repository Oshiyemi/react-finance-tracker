import { useState } from "react";
import Button from "@/components/common/Button";
import EmptyState from "@/components/common/EmptyState";
import Loader from "@/components/common/Loader";
import Modal from "@/components/common/Modal";
import PageHeader from "@/components/common/PageHeader";
import BudgetForm from "@/components/budgets/BudgetForm";
import BudgetSummaryCard from "@/components/budgets/BudgetSummaryCard";
import { useAppStore } from "@/state/useAppStore";
import { getBudgetUsage, getMonthKey } from "@/utils/finance";
import { formatCurrency, formatMonthLabel } from "@/utils/format";

export default function Budgets() {
  const {
    budgets,
    deleteBudget,
    isReady,
    isReadOnly,
    readOnlyMessage,
    transactions,
    upsertBudget,
  } = useAppStore();
  const [selectedMonth, setSelectedMonth] = useState(getMonthKey());
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingBudget, setEditingBudget] = useState(null);

  if (!isReady) {
    return <Loader label="Loading budgets..." />;
  }

  const monthlyBudgets = budgets.filter((budget) => budget.month === selectedMonth);
  const budgetSummaries = monthlyBudgets.map((budget) => ({
    budget,
    usage: getBudgetUsage(budget, transactions),
  }));
  const totalBudgeted = monthlyBudgets.reduce(
    (sum, budget) => sum + Number(budget.monthlyLimit),
    0
  );
  const totalSpent = budgetSummaries.reduce((sum, item) => sum + item.usage.spent, 0);
  const totalRemaining = totalBudgeted - totalSpent;
  const exceededCount = budgetSummaries.filter((item) => item.usage.exceeded).length;

  function openCreateModal() {
    if (isReadOnly) {
      window.alert(readOnlyMessage);
      return;
    }

    setEditingBudget(null);
    setIsModalOpen(true);
  }

  function openEditModal(budget) {
    if (isReadOnly) {
      window.alert(readOnlyMessage);
      return;
    }

    setEditingBudget(budget);
    setIsModalOpen(true);
  }

  function handleSubmit(values) {
    const duplicateBudget = budgets.find(
      (budget) =>
        budget.category === values.category &&
        budget.month === values.month &&
        budget.id !== editingBudget?.id
    );

    if (duplicateBudget) {
      return {
        ok: false,
        message: `A ${values.category} budget already exists for ${formatMonthLabel(
          values.month
        )}.`,
      };
    }

    const result = upsertBudget(values, editingBudget?.id);

    if (result?.ok === false) {
      return result;
    }

    setIsModalOpen(false);
    setEditingBudget(null);

    return { ok: true };
  }

  function handleDelete(budgetId) {
    if (isReadOnly) {
      window.alert(readOnlyMessage);
      return;
    }

    const shouldDelete = window.confirm("Delete this budget?");

    if (shouldDelete) {
      const result = deleteBudget(budgetId);

      if (result?.ok === false) {
        window.alert(result.message);
      }
    }
  }

  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="Monthly guardrails"
        title="Budgets"
        description="Set category limits for each month and compare them against your actual expense activity."
        actions={
          <div className="flex flex-wrap gap-3">
            <input
              type="month"
              value={selectedMonth}
              onChange={(event) => setSelectedMonth(event.target.value)}
              className="field-shell h-11 min-w-[11rem]"
            />
            <Button disabled={isReadOnly} onClick={openCreateModal} title={readOnlyMessage}>
              Add budget
            </Button>
          </div>
        }
      />

      {isReadOnly ? (
        <div className="surface-card border-amber-300/80 bg-amber-50/80 p-4 text-sm text-amber-900 dark:border-amber-500/30 dark:bg-amber-500/10 dark:text-amber-200">
          {readOnlyMessage}
        </div>
      ) : null}

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <div className="surface-card p-5">
          <p className="text-sm text-slate-500 dark:text-slate-400">Month</p>
          <p className="mt-2 text-2xl font-semibold text-slate-950 dark:text-white">
            {formatMonthLabel(selectedMonth)}
          </p>
        </div>
        <div className="surface-card p-5">
          <p className="text-sm text-slate-500 dark:text-slate-400">Budgeted</p>
          <p className="mt-2 text-2xl font-semibold text-slate-950 dark:text-white">
            {formatCurrency(totalBudgeted)}
          </p>
        </div>
        <div className="surface-card p-5">
          <p className="text-sm text-slate-500 dark:text-slate-400">Spent</p>
          <p className="mt-2 text-2xl font-semibold text-slate-950 dark:text-white">
            {formatCurrency(totalSpent)}
          </p>
        </div>
        <div className="surface-card p-5">
          <p className="text-sm text-slate-500 dark:text-slate-400">Categories over limit</p>
          <p className="mt-2 text-2xl font-semibold text-slate-950 dark:text-white">
            {exceededCount}
          </p>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            Remaining: {formatCurrency(totalRemaining)}
          </p>
        </div>
      </div>

      {budgetSummaries.length === 0 ? (
        <EmptyState
          eyebrow="Budget board is empty"
          title={`No budgets for ${formatMonthLabel(selectedMonth)}`}
          message={
            isReadOnly
              ? "Your guest workspace is read-only. Create an account to add budgets and keep planning."
              : "Create category budgets to see remaining spend, warnings, and progress bars for the month."
          }
          action={openCreateModal}
          actionDisabled={isReadOnly}
          actionHint={isReadOnly ? readOnlyMessage : undefined}
          actionLabel="Add monthly budget"
        />
      ) : (
        <div className="grid gap-5">
          {budgetSummaries.map(({ budget, usage }) => (
            <BudgetSummaryCard
              key={budget.id}
              budget={budget}
              disabled={isReadOnly}
              disabledMessage={readOnlyMessage}
              onDelete={handleDelete}
              onEdit={openEditModal}
              usage={usage}
            />
          ))}
        </div>
      )}

      <Modal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingBudget(null);
        }}
        title={editingBudget ? "Edit budget" : "Add budget"}
        description="Budgets are tracked by category and month. Expense transactions update the spend figure automatically."
      >
        <BudgetForm
          budget={editingBudget}
          disabled={isReadOnly}
          defaultMonth={selectedMonth}
          onCancel={() => {
            setIsModalOpen(false);
            setEditingBudget(null);
          }}
          onSubmit={handleSubmit}
          submitLabel={editingBudget ? "Update budget" : "Save budget"}
        />
      </Modal>
    </div>
  );
}
