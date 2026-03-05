import { format, parse, parseISO } from "date-fns";

const currencyFormatter = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  minimumFractionDigits: 2,
});

const percentFormatter = new Intl.NumberFormat("en-US", {
  style: "percent",
  minimumFractionDigits: 0,
  maximumFractionDigits: 1,
});

/**
 * @param {number} value
 * @returns {string}
 */
export function formatCurrency(value) {
  return currencyFormatter.format(Number(value) || 0);
}

/**
 * @param {number} value
 * @returns {string}
 */
export function formatPercent(value) {
  return percentFormatter.format(Number.isFinite(value) ? value : 0);
}

/**
 * @param {string} monthKey
 * @param {string} [token]
 * @returns {string}
 */
export function formatMonthLabel(monthKey, token = "MMMM yyyy") {
  if (!monthKey) {
    return "Unknown month";
  }

  return format(parse(`${monthKey}-01`, "yyyy-MM-dd", new Date()), token);
}

/**
 * @param {string} dateValue
 * @param {string} [token]
 * @returns {string}
 */
export function formatTransactionDate(dateValue, token = "MMM d, yyyy") {
  if (!dateValue) {
    return "Unknown date";
  }

  return format(parseISO(dateValue), token);
}

/**
 * @param {string} name
 * @returns {string}
 */
export function getInitials(name) {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");
}
