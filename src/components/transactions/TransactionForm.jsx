import { useEffect, useState } from "react";
import Button from "@/components/common/Button";
import Input from "@/components/common/Input";
import { EXPENSE_CATEGORIES, INCOME_CATEGORIES } from "@/utils/constants";
import { validateTransaction } from "@/utils/validators";

function createInitialValues(transaction) {
  return {
    title: transaction?.title || "",
    amount: transaction?.amount?.toString() || "",
    category: transaction?.category || "",
    date: transaction?.date || new Date().toISOString().slice(0, 10),
    type: transaction?.type || "expense",
    notes: transaction?.notes || "",
  };
}

export default function TransactionForm({
  disabled = false,
  initialValues,
  onCancel,
  onSubmit,
  submitLabel = "Save transaction",
}) {
  const [values, setValues] = useState(createInitialValues(initialValues));
  const [errors, setErrors] = useState({});

  useEffect(() => {
    setValues(createInitialValues(initialValues));
    setErrors({});
  }, [initialValues]);

  const availableCategories =
    values.type === "income" ? INCOME_CATEGORIES : EXPENSE_CATEGORIES;

  function updateValue(field, fieldValue) {
    setValues((currentValues) => ({
      ...currentValues,
      [field]: fieldValue,
      ...(field === "type" ? { category: "" } : {}),
    }));
  }

  function handleSubmit(event) {
    event.preventDefault();

    if (disabled) {
      return;
    }

    const validationErrors = validateTransaction(values);
    setErrors(validationErrors);

    if (Object.keys(validationErrors).length > 0) {
      return;
    }

    const result = onSubmit(values);

    if (result?.ok === false) {
      setErrors((currentErrors) => ({
        ...currentErrors,
        form: result.message,
      }));
    }
  }

  return (
    <form className="space-y-4" onSubmit={handleSubmit} noValidate>
      <div className="grid gap-4 md:grid-cols-2">
        <Input
          id="transaction-type"
          as="select"
          label="Type"
          required
          disabled={disabled}
          value={values.type}
          onChange={(event) => updateValue("type", event.target.value)}
        >
          <option value="expense">Expense</option>
          <option value="income">Income</option>
        </Input>

        <Input
          id="transaction-date"
          label="Date"
          type="date"
          required
          disabled={disabled}
          value={values.date}
          error={errors.date}
          onChange={(event) => updateValue("date", event.target.value)}
        />
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Input
          id="transaction-title"
          label="Title"
          required
          disabled={disabled}
          maxLength={120}
          placeholder="Quarterly bonus, rent, groceries..."
          value={values.title}
          error={errors.title}
          onChange={(event) => updateValue("title", event.target.value)}
        />

        <Input
          id="transaction-amount"
          label="Amount"
          type="number"
          required
          disabled={disabled}
          min="0"
          step="0.01"
          placeholder="0.00"
          value={values.amount}
          error={errors.amount}
          onChange={(event) => updateValue("amount", event.target.value)}
        />
      </div>

      <Input
        id="transaction-category"
        as="select"
        label="Category"
        required
        disabled={disabled}
        value={values.category}
        error={errors.category}
        onChange={(event) => updateValue("category", event.target.value)}
      >
        <option value="">Select a category</option>
        {availableCategories.map((category) => (
          <option key={category} value={category}>
            {category}
          </option>
        ))}
      </Input>

      <Input
        id="transaction-notes"
        as="textarea"
        label="Notes"
        optionalLabel="optional"
        disabled={disabled}
        rows={3}
        maxLength={1000}
        placeholder="Optional context for this transaction."
        value={values.notes}
        onChange={(event) => updateValue("notes", event.target.value)}
      />

      {errors.form ? (
        <p role="alert" className="text-sm text-rose-700 dark:text-rose-300">
          {errors.form}
        </p>
      ) : null}

      <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
        <Button variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" disabled={disabled}>
          {submitLabel}
        </Button>
      </div>
    </form>
  );
}
