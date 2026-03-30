import { useState } from "react";
import { CalendarDays, Plus } from "lucide-react";
import Button from "@/components/common/Button";
import EmptyState from "@/components/common/EmptyState";
import Loader from "@/components/common/Loader";
import Modal from "@/components/common/Modal";
import PageHeader from "@/components/common/PageHeader";
import StatTile from "@/components/common/StatTile";
import StatusBanner from "@/components/common/StatusBanner";
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
    <div className="page-stack">
      <PageHeader
        eyebrow="Budgets"
        title="Monthly budget planner"
        description="Set category spending limits and monitor progress against real transactions."
        actions={
          <div className="flex flex-wrap gap-2">
            <input
              id="budget-month-selector"
              aria-label="Select month"
              type="month"
              className="field-shell h-10 min-w-[11rem]"
              value={selectedMonth}
              onChange={(event) => setSelectedMonth(event.target.value)}
            />
            <Button disabled={isReadOnly} onClick={openCreateModal} title={readOnlyMessage}>
              <Plus className="h-4 w-4" />
              Add budget
            </Button>
          </div>
        }
      />

      {isReadOnly ? (
        <StatusBanner tone="warning" title="Read-only mode">
          {readOnlyMessage}
        </StatusBanner>
      ) : null}

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatTile
          caption="Month"
          value={formatMonthLabel(selectedMonth)}
          helper={<span className="inline-flex items-center gap-1"><CalendarDays className="h-3.5 w-3.5" />Current selection</span>}
        />
        <StatTile caption="Budgeted" value={formatCurrency(totalBudgeted)} />
        <StatTile caption="Spent" value={formatCurrency(totalSpent)} />
        <StatTile
          caption="Over limit"
          value={exceededCount}
          helper={`Remaining ${formatCurrency(totalRemaining)}`}
        />
      </div>

      {budgetSummaries.length === 0 ? (
        <EmptyState
          eyebrow="No budgets"
          title={`No budgets for ${formatMonthLabel(selectedMonth)}`}
          message={
            isReadOnly
              ? "Guest workspace is read-only. Create an account to add and update budgets."
              : "Create category budgets to track remaining spend and over-budget alerts."
          }
          action={openCreateModal}
          actionDisabled={isReadOnly}
          actionHint={isReadOnly ? readOnlyMessage : undefined}
          actionLabel="Add monthly budget"
        />
      ) : (
        <div className="grid gap-4">
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
        description="Budgets are grouped by month and expense category."
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

