import { getDateError, isDateRangeValid } from "./dateUtils";

export function comparableDomains(rows) {
  return rows
    .filter((r) => !(r.name.trim() === "" && !r.teamLeaderId))
    .map((r) => ({ id: r.id ?? null, name: r.name.trim(), teamLeaderId: r.teamLeaderId || "" }));
}

export function buildBatchFormSnapshot(batch, rows) {
  return {
    batchNumber: batch?.batchNumber ?? 0,
    program: batch?.program ?? "",
    year: batch?.year ?? new Date().getFullYear(),
    startDate: batch?.startDate ?? "",
    endDate: batch?.endDate ?? "",
    status: batch?.status ?? "Active",
    domains: comparableDomains(rows),
  };
}

export function generateBatchCode(number, program, year) {
  return `B${number}-${program.toUpperCase()}-${year}`;
}

export function isBatchFormSaveable(form, snapshot) {
  const current = buildBatchFormSnapshot(
    { batchNumber: form.batchNumber, program: form.program, year: form.year, startDate: form.startDate, endDate: form.endDate, status: form.status },
    form.rows
  );
  const dirty = JSON.stringify(current) !== JSON.stringify(snapshot);
  const basicsOk = String(form.batchNumber).trim().length > 0 && form.program.trim().length > 0 && String(form.year).trim().length === 4;
  const datesOk =
    !getDateError(form.startDate, { required: true }) && !getDateError(form.endDate) && isDateRangeValid(form.startDate, form.endDate);
  const domainsNamed = current.domains.every((d) => d.name.length > 0);
  return dirty && basicsOk && datesOk && domainsNamed;
}
