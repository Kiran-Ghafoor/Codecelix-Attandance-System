import { getDateError, isDateRangeValid } from "./dateUtils";
import { FIXED_DOMAINS } from "./registration";

export const FIXED_PROGRAM = "CODECELIX";

export function fixedDomainRows() {
  return FIXED_DOMAINS.map((name) => ({ key: `fixed-domain-${name}`, id: null, name, teamLeaderId: "", custom: false }));
}

// A fresh, unnamed row the admin fills in to add a domain beyond the fixed set.
export function customDomainRow() {
  return { key: `custom-new-${Date.now().toString(36)}`, id: null, name: "", teamLeaderId: "", custom: true };
}

export function comparableDomains(rows) {
  return rows
    .filter((r) => r.name && r.name.trim())
    .map((r) => ({ id: r.id ?? null, name: r.name.trim(), teamLeaderId: r.teamLeaderId || "" }));
}

export function buildBatchFormSnapshot(batch, rows) {
  return {
    batchCode: batch?.batchCode ?? "",
    program: batch?.program ?? FIXED_PROGRAM,
    mode: batch?.mode ?? "Onsite",
    year: batch?.year ?? new Date().getFullYear(),
    startDate: batch?.startDate ?? "",
    endDate: batch?.endDate ?? "",
    status: batch?.status ?? "Active",
    domains: comparableDomains(rows),
  };
}

export function generateBatchCode(number, year) {
  return `B${number}-${FIXED_PROGRAM}-${year}`;
}

// Generates a URL-safe registration code (default 9 random bytes => 12 chars,
// ~72 bits of entropy), matching the backend's Batch.generateRegistrationCode()
// format so an admin can copy it from the create form and share it directly.
export function generateRegistrationCode(bytes = 9) {
  const arr = new Uint8Array(bytes);
  globalThis.crypto.getRandomValues(arr);
  let bin = "";
  arr.forEach((b) => {
    bin += String.fromCharCode(b);
  });
  return btoa(bin).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");
}

// Internships run for a fixed 3-month term. Given a start date (YYYY-MM-DD),
// returns the date exactly 3 months later (same day-of-month), or "" when no
// start date is chosen yet.
export function endDateFromStart(startDate) {
  if (!startDate || !/^\d{4}-\d{2}-\d{2}$/.test(startDate)) return "";
  const [y, m, d] = startDate.split("-").map(Number);
  return new Date(Date.UTC(y, m - 1 + 3, d)).toISOString().slice(0, 10);
}

export function isBatchFormSaveable(form, snapshot) {
  const current = buildBatchFormSnapshot(
    { batchCode: form.batchCode, program: form.program, mode: form.mode, year: form.year, startDate: form.startDate, endDate: form.endDate, status: form.status },
    form.rows
  );
  const dirty = JSON.stringify(current) !== JSON.stringify(snapshot);
  const codeOk = String(form.batchCode || "").trim().length > 0;
  const basicsOk = codeOk && String(form.year).trim().length === 4;
  const datesOk =
    !getDateError(form.startDate, { required: true }) &&
    (!form.endDate || (!getDateError(form.endDate) && isDateRangeValid(form.startDate, form.endDate)));
  const domainsNamed = current.domains.every((d) => d.name.length > 0);
  return dirty && basicsOk && datesOk && domainsNamed;
}
