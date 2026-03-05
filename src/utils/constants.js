const ENV = typeof import.meta !== "undefined" && import.meta.env ? import.meta.env : {};

/**
 * @param {string | number | undefined} value
 * @param {number} fallback
 * @param {{ min?: number, max?: number }} [limits]
 * @returns {number}
 */
function parsePositiveInt(value, fallback, limits = {}) {
  const parsed = Number.parseInt(String(value ?? ""), 10);

  if (!Number.isFinite(parsed) || parsed <= 0) {
    return fallback;
  }

  if (typeof limits.min === "number" && parsed < limits.min) {
    return limits.min;
  }

  if (typeof limits.max === "number" && parsed > limits.max) {
    return limits.max;
  }

  return parsed;
}

export const APP_NAME = "FinTrack Wealth";
export const STORAGE_SCHEMA_VERSION = "v2";
export const GUEST_NAMESPACE = "guest";
export const GUEST_TRIAL_DAYS = parsePositiveInt(ENV.VITE_GUEST_TRIAL_DAYS, 7, {
  min: 1,
  max: 30,
});
export const AUTH_MAX_LOGIN_ATTEMPTS = parsePositiveInt(
  ENV.VITE_AUTH_MAX_LOGIN_ATTEMPTS,
  8,
  { min: 3, max: 25 }
);
export const AUTH_ATTEMPT_WINDOW_MINUTES = parsePositiveInt(
  ENV.VITE_AUTH_ATTEMPT_WINDOW_MINUTES,
  10,
  { min: 1, max: 120 }
);

export const EXPENSE_CATEGORIES = [
  "Housing",
  "Food",
  "Transportation",
  "Utilities",
  "Healthcare",
  "Insurance",
  "Shopping",
  "Entertainment",
  "Education",
  "Travel",
  "Personal Care",
  "Debt Payments",
  "Gifts",
  "Other",
];

export const INCOME_CATEGORIES = [
  "Salary",
  "Freelance",
  "Investments",
  "Bonus",
  "Rental Income",
  "Side Hustle",
  "Refund",
  "Other Income",
];

export const CATEGORY_COLORS = {
  Housing: "#0f766e",
  Food: "#059669",
  Transportation: "#f59e0b",
  Utilities: "#14b8a6",
  Healthcare: "#ef4444",
  Insurance: "#6366f1",
  Shopping: "#ec4899",
  Entertainment: "#8b5cf6",
  Education: "#06b6d4",
  Travel: "#f97316",
  "Personal Care": "#eab308",
  "Debt Payments": "#dc2626",
  Gifts: "#a855f7",
  Other: "#64748b",
  Salary: "#10b981",
  Freelance: "#22c55e",
  Investments: "#84cc16",
  Bonus: "#facc15",
  "Rental Income": "#2dd4bf",
  "Side Hustle": "#34d399",
  Refund: "#38bdf8",
  "Other Income": "#94a3b8",
};

export const NAV_ITEMS = [
  { to: "/dashboard", label: "Dashboard" },
  { to: "/transactions", label: "Transactions" },
  { to: "/budgets", label: "Budgets" },
  { to: "/analytics", label: "Analytics" },
  { to: "/settings", label: "Settings" },
];
