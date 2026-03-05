import { useState } from "react";
import Button from "@/components/common/Button";
import EmptyState from "@/components/common/EmptyState";
import Loader from "@/components/common/Loader";
import Modal from "@/components/common/Modal";
import PageHeader from "@/components/common/PageHeader";
import TransactionFilters from "@/components/transactions/TransactionFilters";
import TransactionForm from "@/components/transactions/TransactionForm";
import TransactionTable from "@/components/transactions/TransactionTable";
import { useAppStore } from "@/state/useAppStore";
import { getMonthKey } from "@/utils/finance";

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
  const [filters, setFilters] = useState({
    search: "",
    type: "all",
    category: "all",
    month: "",
  });
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState(null);

  if (!isReady) {
    return <Loader label="Loading transactions..." />;
  }

  const filteredTransactions = transactions.filter((transaction) => {
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
  });

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

    const shouldDelete = window.confirm(
      "Delete this transaction? This cannot be undone."
    );

    if (!shouldDelete) {
      return;
    }

    const result = deleteTransaction(transactionId);

    if (result?.ok === false) {
      window.alert(result.message);
    }
  }

  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="Money movement"
        title="Transactions"
        description="Capture income and expenses, then filter the ledger by type, category, or month."
        actions={
          <Button disabled={isReadOnly} onClick={openCreateModal} title={readOnlyMessage}>
            Add transaction
          </Button>
        }
      />

      {isReadOnly ? (
        <div className="surface-card border-amber-300/80 bg-amber-50/80 p-4 text-sm text-amber-900 dark:border-amber-500/30 dark:bg-amber-500/10 dark:text-amber-200">
          {readOnlyMessage}
        </div>
      ) : null}

      <div className="grid gap-4 md:grid-cols-3">
        <div className="surface-card p-5">
          <p className="text-sm text-slate-500 dark:text-slate-400">Total records</p>
          <p className="mt-2 text-3xl font-semibold text-slate-950 dark:text-white">
            {transactions.length}
          </p>
        </div>
        <div className="surface-card p-5">
          <p className="text-sm text-slate-500 dark:text-slate-400">Filtered view</p>
          <p className="mt-2 text-3xl font-semibold text-slate-950 dark:text-white">
            {filteredTransactions.length}
          </p>
        </div>
        <div className="surface-card p-5">
          <p className="text-sm text-slate-500 dark:text-slate-400">Default month</p>
          <p className="mt-2 text-3xl font-semibold text-slate-950 dark:text-white">
            {getMonthKey()}
          </p>
        </div>
      </div>

      <div className="surface-card p-6">
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
          eyebrow="Ledger is quiet"
          title="No transactions match this view"
          message={
            transactions.length === 0
              ? isReadOnly
                ? "Your guest workspace is read-only. Create an account to add your first transaction."
                : "Start with your first income or expense and the ledger will populate here."
              : "Adjust your filters or clear the search term to reveal more records."
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
        description="Keep the ledger tidy with clear categories and precise amounts."
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
