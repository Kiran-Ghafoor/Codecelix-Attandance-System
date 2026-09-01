// Shared date-entry validation used by every form/filter that accepts a date.
// Browsers mostly constrain native date pickers, but partial or bogus input
// can still slip through (e.g. typing digits produces years like 2456), and
// programmatic values are never trusted — so every consumer validates here.

export const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

export const MIN_YEAR = 1900;
export const MAX_YEAR = 2100;

/**
 * Strict ISO calendar-date check: exact YYYY-MM-DD shape, sane year range,
 * month 01-12, and a day that actually exists in that month (leap years
 * included).
 */
export function isValidDateString(value) {
  if (typeof value !== "string" || !DATE_PATTERN.test(value)) return false;
  const [year, month, day] = value.split("-").map(Number);
  if (year < MIN_YEAR || year > MAX_YEAR) return false;
  if (month < 1 || month > 12) return false;
  // Round-trip through Date: overflow dates like 2026-02-30 roll over to
  // March, so a mismatch means the day does not exist.
  const probe = new Date(year, month - 1, day);
  return probe.getFullYear() === year && probe.getMonth() === month - 1 && probe.getDate() === day;
}

/** Today's calendar date in local time as "YYYY-MM-DD". */
export function todayISODate() {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, "0");
  const d = String(now.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

/**
 * Human-readable validation message for a single date field, or null when the
 * value is acceptable. Empty input is only an error when `required`.
 */
export function getDateError(value, { required = false } = {}) {
  if (!value) return required ? "Pick a date." : null;
  if (typeof value !== "string" || !DATE_PATTERN.test(value)) {
    return "Enter a complete date (YYYY-MM-DD).";
  }
  const [year, month] = value.split("-").map(Number);
  if (year < MIN_YEAR || year > MAX_YEAR) {
    return `Year must be between ${MIN_YEAR} and ${MAX_YEAR}.`;
  }
  if (month < 1 || month > 12) {
    return "Month must be between 01 and 12.";
  }
  if (!isValidDateString(value)) {
    return "That day doesn't exist in this month.";
  }
  return null;
}

/** Both endpoints valid and start <= end (equal dates allowed). */
export function isDateRangeValid(start, end) {
  if (!start || !end) return true;
  if (!isValidDateString(start) || !isValidDateString(end)) return false;
  return start.localeCompare(end) <= 0;
}

// ---------------------------------------------------------------------------
// Day-of-week helpers
// ---------------------------------------------------------------------------

/** Returns 0 (Sunday) through 6 (Saturday) for a "YYYY-MM-DD" string. */
export function getDayOfWeek(dateString) {
  if (!isValidDateString(dateString)) return -1;
  const [year, month, day] = dateString.split("-").map(Number);
  return new Date(year, month - 1, day).getDay();
}

/** Saturday (6) or Sunday (0). */
export function isWeekend(dateString) {
  const dow = getDayOfWeek(dateString);
  return dow === 0 || dow === 6;
}

const DAY_NAMES = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

/** Human-readable day name, e.g. "Saturday". Returns "" for invalid dates. */
export function getDayName(dateString) {
  const dow = getDayOfWeek(dateString);
  return dow >= 0 ? DAY_NAMES[dow] : "";
}
