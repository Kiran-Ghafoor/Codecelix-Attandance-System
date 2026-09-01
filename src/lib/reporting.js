// ---------------------------------------------------------------------------
// Reporting aggregation (frontend preview only)
//
// These helpers aggregate server-decided attendance statuses into the numbers
// an admin sees on screen. They never derive a status — that remains backend
// authority. The backend computes the same aggregates (and the Excel workbook)
// from stored records; keeping the math here small and pure makes swapping in
// API responses straightforward.
//
// Attendance % semantics:
//   - attendance is binary: present or absent
//   - "off" (weekend) and "pending" rows are excluded from the denominator
//   - percent = round(present / working-days * 100)
// ---------------------------------------------------------------------------

export const MONTH_NAMES = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

const WEEKDAY_LABELS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export function monthKey(date) {
  return date.slice(0, 7);
}

export function monthLabel(key) {
  const [year, month] = key.split("-").map(Number);
  return `${MONTH_NAMES[month - 1]} ${year}`;
}

export function weekdayLabel(date) {
  const [y, m, d] = date.split("-").map(Number);
  return WEEKDAY_LABELS[new Date(y, m - 1, d).getDay()];
}

export function countByStatus(records) {
  const counts = { present: 0, absent: 0, pending: 0, off: 0 };
  for (const r of records) {
    if (r.status in counts) counts[r.status] += 1;
  }
  return counts;
}

// Returns null when there is no meaningful denominator (e.g. no working days)
// so callers can render an em-dash instead of a fake zero.
export function attendancePercent(counts, totalDays) {
  const denominator = totalDays - counts.off;
  if (!denominator || denominator <= 0) return null;
  return Math.round((counts.present / denominator) * 100);
}

export function averagePercent(percents) {
  const valid = percents.filter((p) => p !== null && p !== undefined);
  if (valid.length === 0) return null;
  return Math.round(valid.reduce((sum, p) => sum + p, 0) / valid.length);
}

export function groupBy(records, keyFn) {
  const map = new Map();
  for (const record of records) {
    const key = keyFn(record);
    if (!map.has(key)) map.set(key, []);
    map.get(key).push(record);
  }
  return map;
}
