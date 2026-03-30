import { useEffect, useState } from "react";
import Button from "@/components/common/Button";
import Input from "@/components/common/Input";
import { EXPENSE_CATEGORIES } from "@/utils/constants";
import { validateBudget } from "@/utils/validators";

function createInitialValues(budget, defaultMonth) {
  return {
    category: budget?.category || "",
    month: budget?.month || defaultMonth,
    monthlyLimit: budget?.monthlyLimit?.toString() || "",
    notes: budget?.notes || "",
  };
}

export default function BudgetForm({
  budget,
  disabled = false,
  defaultMonth,
  onCancel,
  onSubmit,
  submitLabel = "Save budget",
}) {
  const [values, setValues] = useState(createInitialValues(budget, defaultMonth));
  const [errors, setErrors] = useState({});

  useEffect(() => {
    setValues(createInitialValues(budget, defaultMonth));
    setErrors({});
  }, [budget, defaultMonth]);

  function updateValue(field, fieldValue) {
    setValues((currentValues) => ({
      ...currentValues,
      [field]: fieldValue,
    }));
  }

  function handleSubmit(event) {
    event.preventDefault();

    if (disabled) {
      return;
    }

    const validationErrors = validateBudget(values);
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
          id="budget-month"
          label="Month"
          type="month"
          required
          disabled={disabled}
          value={values.month}
          error={errors.month}
          onChange={(event) => updateValue("month", event.target.value)}
        />

        <Input
          id="budget-limit"
          label="Monthly limit"
          type="number"
          required
          disabled={disabled}
          min="0"
          step="0.01"
          placeholder="0.00"
          value={values.monthlyLimit}
          error={errors.monthlyLimit}
          onChange={(event) => updateValue("monthlyLimit", event.target.value)}
        />
      </div>

      <Input
        id="budget-category"
        as="select"
        label="Expense category"
        required
        disabled={disabled}
        value={values.category}
        error={errors.category}
        onChange={(event) => updateValue("category", event.target.value)}
      >
        <option value="">Select a category</option>
        {EXPENSE_CATEGORIES.map((category) => (
          <option key={category} value={category}>
            {category}
          </option>
        ))}
      </Input>

      <Input
        id="budget-notes"
        as="textarea"
        label="Notes"
        optionalLabel="optional"
        disabled={disabled}
        rows={3}
        maxLength={1000}
        placeholder="Optional note for your future self."
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
