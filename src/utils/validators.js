/**
 * @param {string} value
 * @returns {string}
 */
export function normalizeEmail(value) {
  return value.trim().toLowerCase();
}

/**
 * @param {Record<string, string>} values
 * @returns {Record<string, string>}
 */
export function validateLogin(values) {
  const errors = {};

  if (!values.email?.trim()) {
    errors.email = "Email is required.";
  } else if (!/^\S+@\S+\.\S+$/.test(values.email.trim())) {
    errors.email = "Enter a valid email address.";
  }

  if (!values.password?.trim()) {
    errors.password = "Password is required.";
  } else if (values.password.trim().length < 8) {
    errors.password = "Password must be at least 8 characters.";
  }

  return errors;
}

/**
 * @param {Record<string, string>} values
 * @returns {Record<string, string>}
 */
export function validateRegister(values) {
  const errors = validateLogin(values);

  if (!values.name?.trim()) {
    errors.name = "Full name is required.";
  } else if (values.name.trim().length < 2) {
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

  if (!values.title?.trim()) {
    errors.title = "A transaction title is required.";
  }

  if (!values.amount?.toString().trim()) {
    errors.amount = "Enter an amount.";
  } else if (Number(values.amount) <= 0 || Number.isNaN(Number(values.amount))) {
    errors.amount = "Amount must be a positive number.";
  }

  if (!values.category?.trim()) {
    errors.category = "Select a category.";
  }

  if (!values.date?.trim()) {
    errors.date = "Choose a date.";
  }

  return errors;
}

/**
 * @param {Record<string, string>} values
 * @returns {Record<string, string>}
 */
export function validateBudget(values) {
  const errors = {};

  if (!values.category?.trim()) {
    errors.category = "Pick a category.";
  }

  if (!values.month?.trim()) {
    errors.month = "Choose a month.";
  }

  if (!values.monthlyLimit?.toString().trim()) {
    errors.monthlyLimit = "Enter a monthly limit.";
  } else if (
    Number(values.monthlyLimit) <= 0 ||
    Number.isNaN(Number(values.monthlyLimit))
  ) {
    errors.monthlyLimit = "Budget must be a positive number.";
  }

  return errors;
}
