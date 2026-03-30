import Input from "@/components/common/Input";
import { EXPENSE_CATEGORIES, INCOME_CATEGORIES } from "@/utils/constants";

const categories = Array.from(new Set([...EXPENSE_CATEGORIES, ...INCOME_CATEGORIES]));

export default function TransactionFilters({ filters, onChange }) {
  return (
    <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
      <Input
        id="transaction-search"
        label="Search"
        placeholder="Title or notes"
        value={filters.search}
        onChange={(event) => onChange("search", event.target.value)}
      />

      <Input
        id="transaction-type-filter"
        as="select"
        label="Type"
        value={filters.type}
        onChange={(event) => onChange("type", event.target.value)}
      >
        <option value="all">All types</option>
        <option value="income">Income</option>
        <option value="expense">Expense</option>
      </Input>

      <Input
        id="transaction-category-filter"
        as="select"
        label="Category"
        value={filters.category}
        onChange={(event) => onChange("category", event.target.value)}
      >
        <option value="all">All categories</option>
        {categories.map((category) => (
          <option key={category} value={category}>
            {category}
          </option>
        ))}
      </Input>

      <Input
        id="transaction-month-filter"
        label="Month"
        type="month"
        value={filters.month}
        onChange={(event) => onChange("month", event.target.value)}
      />
    </div>
  );
}
