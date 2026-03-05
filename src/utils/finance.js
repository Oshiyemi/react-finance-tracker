import { format, parse, subMonths } from "date-fns";
import { CATEGORY_COLORS } from "@/utils/constants";

/**
 * @param {string | Date} value
 * @returns {string}
 */
export function getMonthKey(value = new Date()) {
  const date =
    typeof value === "string"
      ? parse(`${value}-01`, "yyyy-MM-dd", new Date())
      : value;

  return format(date, "yyyy-MM");
}

/**
 * @param {number} [count]
 * @param {string} [anchorMonth]
 * @returns {{ value: string, label: string, shortLabel: string }[]}
 */
export function getMonthOptions(count = 12, anchorMonth = getMonthKey()) {
  const anchorDate = parse(`${anchorMonth}-01`, "yyyy-MM-dd", new Date());

  return Array.from({ length: count }, (_, index) => {
    const date = subMonths(anchorDate, index);

    return {
      value: format(date, "yyyy-MM"),
      label: format(date, "MMMM yyyy"),
      shortLabel: format(date, "MMM yyyy"),
    };
  });
}

/**
 * @param {Array<Record<string, any>>} transactions
 * @param {string} month
 * @returns {Array<Record<string, any>>}
 */
export function filterTransactionsByMonth(transactions, month) {
  return transactions.filter((transaction) => transaction.date?.startsWith(month));
}

/**
 * @param {Array<Record<string, any>>} transactions
 * @returns {{ income: number, expenses: number, savings: number }}
 */
export function calculateTotals(transactions) {
  const income = transactions
    .filter((transaction) => transaction.type === "income")
    .reduce((sum, transaction) => sum + Number(transaction.amount), 0);

  const expenses = transactions
    .filter((transaction) => transaction.type === "expense")
    .reduce((sum, transaction) => sum + Number(transaction.amount), 0);

  return {
    income,
    expenses,
    savings: income - expenses,
  };
}

/**
 * @param {Array<Record<string, any>>} transactions
 * @returns {{ name: string, value: number, fill: string }[]}
 */
export function getCategoryBreakdown(transactions) {
  const totals = transactions
    .filter((transaction) => transaction.type === "expense")
    .reduce((accumulator, transaction) => {
      accumulator[transaction.category] =
        (accumulator[transaction.category] || 0) + Number(transaction.amount);

      return accumulator;
    }, {});

  return Object.entries(totals)
    .map(([name, value]) => ({
      name,
      value,
      fill: CATEGORY_COLORS[name] || "#94a3b8",
    }))
    .sort((left, right) => right.value - left.value);
}

/**
 * @param {Array<Record<string, any>>} transactions
 * @returns {{ category: string, amount: number }}
 */
export function getTopSpendingCategory(transactions) {
  const [topCategory] = getCategoryBreakdown(transactions);

  if (!topCategory) {
    return {
      category: "No expenses yet",
      amount: 0,
    };
  }

  return {
    category: topCategory.name,
    amount: topCategory.value,
  };
}

/**
 * @param {Array<Record<string, any>>} transactions
 * @param {string} selectedMonth
 * @param {number} [months]
 * @returns {{ label: string, month: string, expenses: number, income: number }[]}
 */
export function getExpenseTrend(transactions, selectedMonth, months = 6) {
  const monthOptions = getMonthOptions(months, selectedMonth).reverse();

  return monthOptions.map((option) => {
    const monthTransactions = filterTransactionsByMonth(transactions, option.value);
    const totals = calculateTotals(monthTransactions);

    return {
      label: option.shortLabel,
      month: option.value,
      expenses: totals.expenses,
      income: totals.income,
    };
  });
}

/**
 * @param {Record<string, any>} budget
 * @param {Array<Record<string, any>>} transactions
 * @returns {{ spent: number, remaining: number, progress: number, exceeded: boolean }}
 */
export function getBudgetUsage(budget, transactions) {
  const spent = transactions
    .filter(
      (transaction) =>
        transaction.type === "expense" &&
        transaction.category === budget.category &&
        transaction.date?.startsWith(budget.month)
    )
    .reduce((sum, transaction) => sum + Number(transaction.amount), 0);

  const remaining = Number(budget.monthlyLimit) - spent;
  const progress = Number(budget.monthlyLimit)
    ? Math.min((spent / Number(budget.monthlyLimit)) * 100, 100)
    : 0;

  return {
    spent,
    remaining,
    progress,
    exceeded: remaining < 0,
  };
}

/**
 * @param {Array<Record<string, any>>} transactions
 * @param {number} [limit]
 * @returns {Array<Record<string, any>>}
 */
export function getRecentTransactions(transactions, limit = 5) {
  return [...transactions]
    .sort((left, right) => new Date(right.date) - new Date(left.date))
    .slice(0, limit);
}
