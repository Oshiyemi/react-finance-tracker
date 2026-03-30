import { useMemo, useState } from "react";
import { Eraser, Plus } from "lucide-react";
import Button from "@/components/common/Button";
import EmptyState from "@/components/common/EmptyState";
import Loader from "@/components/common/Loader";
import Modal from "@/components/common/Modal";
import PageHeader from "@/components/common/PageHeader";
import StatTile from "@/components/common/StatTile";
import StatusBanner from "@/components/common/StatusBanner";
import TransactionFilters from "@/components/transactions/TransactionFilters";
import TransactionForm from "@/components/transactions/TransactionForm";
import TransactionTable from "@/components/transactions/TransactionTable";
import { useAppStore } from "@/state/useAppStore";
import { getMonthKey } from "@/utils/finance";

const DEFAULT_FILTERS = {
  search: "",
  type: "all",
  category: "all",
  month: "",
};

export default function Transactions() {
  const {
    addTransaction,
    deleteTransaction,
    isReady,
    isReadOnly,
    readOnlyMessage,
    transactions,
    updateTransaction,
  } = useAppStore();
  const [filters, setFilters] = useState(DEFAULT_FILTERS);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState(null);

  if (!isReady) {
    return <Loader label="Loading transactions..." />;
  }

  const filteredTransactions = useMemo(
    () =>
      transactions.filter((transaction) => {
        if (
          filters.search &&
          !`${transaction.title} ${transaction.notes}`
            .toLowerCase()
            .includes(filters.search.toLowerCase())
        ) {
          return false;
        }

        if (filters.type !== "all" && transaction.type !== filters.type) {
          return false;
        }

        if (filters.category !== "all" && transaction.category !== filters.category) {
          return false;
        }

        if (filters.month && !transaction.date.startsWith(filters.month)) {
          return false;
        }

        return true;
      }),
    [filters, transactions]
  );

  function openCreateModal() {
    if (isReadOnly) {
      window.alert(readOnlyMessage);
      return;
    }

    setEditingTransaction(null);
    setIsModalOpen(true);
  }

  function openEditModal(transaction) {
    if (isReadOnly) {
      window.alert(readOnlyMessage);
      return;
    }

    setEditingTransaction(transaction);
    setIsModalOpen(true);
  }

  function handleSubmit(values) {
    const result = editingTransaction
      ? updateTransaction(editingTransaction.id, values)
      : addTransaction(values);

    if (result?.ok === false) {
      return result;
    }

    setIsModalOpen(false);
    setEditingTransaction(null);
    return { ok: true };
  }

  function handleDelete(transactionId) {
    if (isReadOnly) {
      window.alert(readOnlyMessage);
      return;
    }

    const shouldDelete = window.confirm("Delete this transaction? This cannot be undone.");

    if (!shouldDelete) {
      return;
    }

    const result = deleteTransaction(transactionId);

    if (result?.ok === false) {
      window.alert(result.message);
    }
  }

  return (
    <div className="page-stack">
      <PageHeader
        eyebrow="Transactions"
        title="Transaction ledger"
        description="Add, filter, and manage income or expense records."
        actions={
          <Button disabled={isReadOnly} onClick={openCreateModal} title={readOnlyMessage}>
            <Plus className="h-4 w-4" />
            Add transaction
          </Button>
        }
      />

      {isReadOnly ? (
        <StatusBanner tone="warning" title="Read-only mode">
          {readOnlyMessage}
        </StatusBanner>
      ) : null}

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        <StatTile caption="Total records" value={transactions.length} />
        <StatTile caption="Filtered records" value={filteredTransactions.length} />
        <StatTile caption="Current month key" value={getMonthKey()} helper="Format: YYYY-MM" />
      </div>

      <div className="surface-card p-4 sm:p-5">
        <div className="mb-3 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <h2 className="text-lg font-semibold text-slate-950 dark:text-white">Filters</h2>
          <Button variant="ghost" size="sm" onClick={() => setFilters(DEFAULT_FILTERS)}>
            <Eraser className="h-4 w-4" />
            Clear filters
          </Button>
        </div>
        <TransactionFilters
          filters={filters}
          onChange={(field, value) =>
            setFilters((currentFilters) => ({
              ...currentFilters,
              [field]: value,
            }))
          }
        />
      </div>

      {filteredTransactions.length === 0 ? (
        <EmptyState
          eyebrow="No records"
          title="No transactions in this view"
          message={
            transactions.length === 0
              ? isReadOnly
                ? "Guest workspace is read-only. Create an account to add your first transaction."
                : "Add your first income or expense to start building your ledger."
              : "Try different filters or clear your search to show more records."
          }
          action={transactions.length === 0 ? openCreateModal : undefined}
          actionDisabled={transactions.length === 0 ? isReadOnly : false}
          actionHint={transactions.length === 0 && isReadOnly ? readOnlyMessage : undefined}
          actionLabel={transactions.length === 0 ? "Add first transaction" : undefined}
        />
      ) : (
        <TransactionTable
          disabled={isReadOnly}
          disabledMessage={readOnlyMessage}
          onDelete={handleDelete}
          onEdit={openEditModal}
          transactions={filteredTransactions}
        />
      )}

      <Modal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingTransaction(null);
        }}
        title={editingTransaction ? "Edit transaction" : "Add transaction"}
        description="Use clear titles and categories for better reporting."
      >
        <TransactionForm
          disabled={isReadOnly}
          initialValues={editingTransaction}
          onCancel={() => {
            setIsModalOpen(false);
            setEditingTransaction(null);
          }}
          onSubmit={handleSubmit}
          submitLabel={editingTransaction ? "Update transaction" : "Save transaction"}
        />
      </Modal>
    </div>
  );
}

