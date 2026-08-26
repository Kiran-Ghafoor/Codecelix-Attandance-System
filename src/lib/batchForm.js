// Pure save-gating logic for the batch create/edit form (no React).
//
// A domain row counts as "pristine empty" only when it has NO name and NO
// leader — those are scaffolding left over from "Add domain" and are ignored
// for validation/dirty-tracking and stripped from the saved payload, so they
// can never block saving.

import { getDateError, isDateRangeValid } from "./dateUtils";

export function comparableDomains(rows) {
  return rows
    .filter((r) => !(r.name.trim() === "" && !r.teamLeaderId))
    .map((r) => ({ id: r.id ?? null, name: r.name.trim(), teamLeaderId: r.teamLeaderId || "" }));
}

export function buildBatchFormSnapshot(batch, rows) {
  return {
    name: batch?.name ?? "",
    startDate: batch?.startDate ?? "",
    endDate: batch?.endDate ?? "",
    status: batch?.status ?? "Active",
    domains: comparableDomains(rows),
  };
}

/**
 * Save is available the moment ANY single field differs from the loaded
 * batch — including changing just a team leader — while the bare basics
 * (batch name, start date, named domains) stay required.
 */
export function isBatchFormSaveable(form, snapshot) {
  const current = buildBatchFormSnapshot(
    { name: form.name, startDate: form.startDate, endDate: form.endDate, status: form.status },
    form.rows
  );
  const dirty = JSON.stringify(current) !== JSON.stringify(snapshot);
  const basicsOk = form.name.trim().length > 0;
  const datesOk =
    !getDateError(form.startDate, { required: true }) && !getDateError(form.endDate) && isDateRangeValid(form.startDate, form.endDate);
  const domainsNamed = current.domains.every((d) => d.name.length > 0);
  return dirty && basicsOk && datesOk && domainsNamed;
}
