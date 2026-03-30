export const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
export const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;
export const MONTH_PATTERN = /^\d{4}-\d{2}$/;
const PASSWORD_MIN_LENGTH = 8;
const PASSWORD_MAX_LENGTH = 128;

/**
 * @param {unknown} value
 * @returns {string}
 */
function toStringValue(value) {
  return typeof value === "string" ? value : String(value ?? "");
}

/**
 * @param {unknown} value
 * @returns {string}
 */
export function normalizeEmail(value) {
  return toStringValue(value).trim().toLowerCase();
}

/**
 * @param {unknown} value
 * @param {{ maxLength?: number }} [options]
 * @returns {string}
 */
export function normalizeText(value, options = {}) {
  const maxLength = Number.isFinite(options.maxLength) ? options.maxLength : 240;
  return toStringValue(value)
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, Math.max(maxLength, 0));
}

/**
 * @param {unknown} value
 * @param {{ maxLength?: number }} [options]
 * @returns {string}
 */
export function normalizeMultilineText(value, options = {}) {
  const maxLength = Number.isFinite(options.maxLength) ? options.maxLength : 1000;
  return toStringValue(value)
    .replace(/\r\n/g, "\n")
    .replace(/\u0000/g, "")
    .trim()
    .slice(0, Math.max(maxLength, 0));
}

/**
 * @param {unknown} value
 * @returns {string}
 */
export function normalizeDateValue(value) {
  const normalized = toStringValue(value).trim();
  return DATE_PATTERN.test(normalized) ? normalized : "";
}

/**
 * @param {unknown} value
 * @returns {string}
 */
export function normalizeMonthValue(value) {
  const normalized = toStringValue(value).trim();
  return MONTH_PATTERN.test(normalized) ? normalized : "";
}

/**
 * @param {unknown} value
 * @returns {number | null}
 */
export function toPositiveAmount(value) {
  const parsed = Number(value);

  if (!Number.isFinite(parsed) || parsed <= 0) {
    return null;
  }

  return Number(parsed.toFixed(2));
}

/**
 * @param {Record<string, string>} values
 * @returns {Record<string, string>}
 */
export function validateLogin(values) {
  const errors = {};
  const email = normalizeEmail(values.email);
  const passwordLength = toStringValue(values.password).trim().length;

  if (!email) {
    errors.email = "Email is required.";
  } else if (!EMAIL_PATTERN.test(email)) {
    errors.email = "Enter a valid email address.";
  } else if (email.length > 120) {
    errors.email = "Email is too long.";
  }

  if (!passwordLength) {
    errors.password = "Password is required.";
  } else if (passwordLength < PASSWORD_MIN_LENGTH) {
    errors.password = `Password must be at least ${PASSWORD_MIN_LENGTH} characters.`;
  } else if (passwordLength > PASSWORD_MAX_LENGTH) {
    errors.password = `Password must be under ${PASSWORD_MAX_LENGTH + 1} characters.`;
  }

  return errors;
}

/**
 * @param {Record<string, string>} values
 * @returns {Record<string, string>}
 */
export function validateRegister(values) {
  const errors = validateLogin(values);
  const name = normalizeText(values.name, { maxLength: 80 });

  if (!name) {
    errors.name = "Full name is required.";
  } else if (name.length < 2) {
    errors.name = "Use at least 2 characters.";
  }

  if (!values.confirmPassword?.trim()) {
    errors.confirmPassword = "Confirm your password.";
  } else if (values.password !== values.confirmPassword) {
    errors.confirmPassword = "Passwords do not match.";
  }

  return errors;
}

/**
 * @param {Record<string, string>} values
 * @returns {Record<string, string>}
 */
export function validateTransaction(values) {
  const errors = {};
  const title = normalizeText(values.title, { maxLength: 120 });
  const amount = toPositiveAmount(values.amount);
  const category = normalizeText(values.category, { maxLength: 60 });
  const date = normalizeDateValue(values.date);

  if (!title) {
    errors.title = "A transaction title is required.";
  }

  if (!toStringValue(values.amount).trim()) {
    errors.amount = "Enter an amount.";
  } else if (amount === null) {
    errors.amount = "Amount must be a positive number.";
  }

  if (!category) {
    errors.category = "Select a category.";
  }

  if (!date) {
    errors.date = "Choose a valid date.";
  }

  return errors;
}

/**
 * @param {Record<string, string>} values
 * @returns {Record<string, string>}
 */
export function validateBudget(values) {
  const errors = {};
  const category = normalizeText(values.category, { maxLength: 60 });
  const month = normalizeMonthValue(values.month);
  const monthlyLimit = toPositiveAmount(values.monthlyLimit);

  if (!category) {
    errors.category = "Pick a category.";
  }

  if (!month) {
    errors.month = "Choose a valid month.";
  }

  if (!toStringValue(values.monthlyLimit).trim()) {
    errors.monthlyLimit = "Enter a monthly limit.";
  } else if (monthlyLimit === null) {
    errors.monthlyLimit = "Budget must be a positive number.";
  }

  return errors;
}
