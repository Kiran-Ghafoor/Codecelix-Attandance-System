import { isValidDateString } from "./dateUtils";

// Datetimes may arrive ISO-style ("2026-08-24T09:12") or with a plain space
// separator ("2026-08-24 09:12"); both are split the same way.
function splitDateTime(value) {
  const sep = value.search(/[T ]/);
  return sep > -1 ? [value.slice(0, sep), value.slice(sep + 1)] : [value, ""];
}

export function formatDate(isoDate) {
  if (!isoDate) return "—";
  const [dateOnly] = splitDateTime(isoDate);
  if (!isValidDateString(dateOnly)) return "—";
  const date = new Date(`${dateOnly}T00:00:00`);
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

export function initials(name) {
  if (!name) return "?";
  return (
    name
      .trim()
      .split(/\s+/)
      .slice(0, 2)
      .map((word) => word[0].toUpperCase())
      .join("") || "?"
  );
}

// Renders structured times (24-hour "HH:MM" strings or datetimes) as 12-hour
// clock text with an explicit AM/PM marker, e.g. "8:43 PM". Raw values in the
// data layer are never pre-formatted so the future backend keeps owning them.
export function formatTime(value) {
  if (!value) return "—";
  const sep = value.search(/[T ]/);
  const timePart = sep > -1 ? value.slice(sep + 1) : value;
  if (!timePart) return "—";
  const normalized = timePart.length === 5 ? `${timePart}:00` : timePart;
  const date = new Date(`2000-01-01T${normalized}`);
  if (Number.isNaN(date.getTime())) return "—";
  return date.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit", hour12: true });
}

// Renders a structured byte size as display text, e.g. "1.8 MB".
export function formatFileSize(bytes) {
  if (bytes == null) return "—";
  if (bytes < 1024 * 1024) return `${Math.max(1, Math.round(bytes / 1024))} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}
