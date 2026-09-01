import { useMemo, useState } from "react";
import { Copy, Plus, RefreshCw, Trash2 } from "lucide-react";
import Modal from "../ui/Modal";
import Button from "../ui/Button";
import Input from "../ui/Input";
import Select from "../ui/Select";
import { useInternees } from "../../context/InterneesContext";
import {
  buildBatchFormSnapshot,
  comparableDomains,
  customDomainRow,
  endDateFromStart,
  FIXED_PROGRAM,
  generateBatchCode,
  generateRegistrationCode,
  isBatchFormSaveable,
} from "../../lib/batchForm";
import { FIXED_DOMAINS } from "../../lib/registration";
import { getDateError, isDateRangeValid } from "../../lib/dateUtils";

const STATUS_OPTIONS = [
  { value: "Active", label: "Active" },
  { value: "Upcoming", label: "Upcoming" },
  { value: "Inactive", label: "Inactive" },
];

const MODE_OPTIONS = [
  { value: "Online", label: "Online" },
  { value: "Onsite", label: "Onsite" },
];

function toDomainRows(batch) {
  const fixedRows = FIXED_DOMAINS.map((name) => {
    const existing = batch?.domains?.find((d) => d.name === name);
    return existing
      ? { key: `fixed-domain-${name}`, id: existing.id, name: existing.name, teamLeaderId: existing.teamLeaderId || "", custom: false }
      : { key: `fixed-domain-${name}`, id: null, name, teamLeaderId: "", custom: false };
  });

  if (!batch?.domains?.length) return fixedRows;

  const fixedSet = new Set(FIXED_DOMAINS);
  const customRows = batch.domains
    .filter((d) => !fixedSet.has(d.name))
    .map((d) => ({ key: `custom-${d.id}`, id: d.id, name: d.name, teamLeaderId: d.teamLeaderId || "", custom: true }));

  return [...fixedRows, ...customRows];
}

export default function BatchFormModal({ open, onClose, title, initial = null, onSubmit, isDuplicateCode, defaultBatchNumber = 0 }) {
  return (
    <Modal open={open} onClose={onClose} title={title} size="xl">
      {open && (
        <BatchForm
          key={initial?.id ?? "new"}
          initial={initial}
          onClose={onClose}
          onSubmit={onSubmit}
          isDuplicateCode={isDuplicateCode}
          defaultBatchNumber={defaultBatchNumber}
        />
      )}
    </Modal>
  );
}

function BatchForm({ initial, onClose, onSubmit, isDuplicateCode, defaultBatchNumber = 0 }) {
  const { internees } = useInternees();
  const initialNumber = initial?.batchNumber ?? defaultBatchNumber;
  const initialYear = initial?.year ?? new Date().getFullYear();
  const [batchCode, setBatchCode] = useState(initial?.batchCode ?? generateBatchCode(initialNumber, initialYear));
  const [batchNumber, setBatchNumber] = useState(initialNumber);
  const [year, setYear] = useState(initialYear);
  const [startDate, setStartDate] = useState(initial?.startDate ?? "");
  const [endDate, setEndDate] = useState(initial?.endDate ?? "");
  const [endDateAuto, setEndDateAuto] = useState(!initial?.endDate);
  const [status, setStatus] = useState(initial?.status ?? "Active");
  const [mode, setMode] = useState(initial?.mode ?? "Onsite");
  const [rows, setRows] = useState(() => toDomainRows(initial));
  const [dateErrors, setDateErrors] = useState({});
  const [codeError, setCodeError] = useState("");
  const [registrationCode, setRegistrationCode] = useState(initial?.registrationCode ?? generateRegistrationCode());
  const [copied, setCopied] = useState(false);
  const snapshot = useMemo(() => buildBatchFormSnapshot(initial, rows), []);

  const memberOptions = useMemo(
    () => (initial?.id ? internees.filter((i) => i.batchId === initial.id) : []),
    [internees, initial]
  );
  const leaderOptions = [
    { value: "", label: memberOptions.length > 0 ? "Select team leader" : "No internees in this batch yet" },
    ...memberOptions.map((i) => ({ value: i.id, label: i.name })),
  ];

  const suggestedCode = generateBatchCode(batchNumber, year);

  function checkDuplicate(code) {
    const trimmed = String(code || "").trim();
    if (!trimmed) {
      setCodeError("");
      return;
    }
    if (isDuplicateCode && isDuplicateCode(trimmed, initial?.id)) {
      setCodeError(`"${trimmed}" already exists.`);
    } else {
      setCodeError("");
    }
  }

  function changeBatchNumber(val) {
    const num = parseInt(val, 10);
    const next = isNaN(num) ? 0 : num;
    setBatchNumber(next);
    if (!initial && (batchCode === suggestedCode || batchCode === "")) {
      setBatchCode(generateBatchCode(next, year));
    }
  }

  function changeYear(val) {
    const yr = parseInt(val, 10);
    const next = isNaN(yr) ? new Date().getFullYear() : yr;
    setYear(next);
    if (!initial && (batchCode === suggestedCode || batchCode === "")) {
      setBatchCode(generateBatchCode(batchNumber, next));
    }
  }

  function changeBatchCode(val) {
    setBatchCode(val);
    checkDuplicate(val);
  }

  function changeStartDate(value) {
    setStartDate(value);
    const derived = endDateFromStart(value);
    // The internship term defaults to 3 months from the start date. The end
    // date follows automatically while it's still in "auto" mode; typing a
    // custom end date (or clearing it) switches to manual control.
    if (endDateAuto) setEndDate(derived);
    setDateErrors((prev) => ({
      ...prev,
      startDate: getDateError(value, { required: true }),
      endDate: endDate && !isDateRangeValid(value, endDate) ? "End date can't be before the start date." : null,
    }));
  }

  function changeEndDate(value) {
    setEndDate(value);
    setEndDateAuto(false);
    setDateErrors((prev) => ({
      ...prev,
      endDate: value && !isDateRangeValid(startDate, value) ? "End date can't be before the start date." : getDateError(value),
    }));
  }

  function updateDomain(key, patch) {
    setRows((prev) => prev.map((d) => (d.key === key ? { ...d, ...patch } : d)));
  }

  function addCustomDomain() {
    setRows((prev) => [...prev, customDomainRow()]);
  }

  function removeCustomDomain(key) {
    setRows((prev) => prev.filter((d) => d.key !== key));
  }

  function regenerateRegCode() {
    setRegistrationCode(generateRegistrationCode());
    setCopied(false);
  }

  async function copyRegCode() {
    try {
      await navigator.clipboard.writeText(registrationCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      setCopied(false);
    }
  }

  const form = { batchCode, program: FIXED_PROGRAM, mode, year, startDate, endDate, status, rows };
  const valid = isBatchFormSaveable(form, snapshot) && !codeError;

  function handleSubmit(event) {
    event.preventDefault();
    if (!valid) return;
    onSubmit({
      batchCode: String(batchCode).trim(),
      program: FIXED_PROGRAM,
      mode,
      year,
      startDate,
      endDate,
      status,
      registrationCode,
      domains: comparableDomains(rows),
    });
    onClose();
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="rounded-xl border border-steel-200/60 bg-steel-50/50 p-4">
        <p className="mb-3 text-[12px] font-medium uppercase tracking-wide text-steel-400">Batch Identity</p>
      <div className="rounded-xl border border-brand-200/70 bg-brand-50/40 p-4">
        <p className="mb-2 text-[12px] font-medium uppercase tracking-wide text-steel-400">
          Internee registration code
        </p>
        <p className="mb-3 text-[12px] text-steel-500">
          Share this code with applicants — they must enter it when registering for this batch. Copy it now or
          any time later from the batch details.
        </p>
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <code className="select-all rounded-lg border border-steel-200 bg-white px-3 py-2 font-mono text-[15px] font-semibold tracking-wide text-steel-800">
            {registrationCode || "…"}
          </code>
          <div className="flex items-center gap-2">
            <Button type="button" variant="secondary" size="sm" icon={RefreshCw} onClick={regenerateRegCode}>
              Regenerate
            </Button>
            <Button type="button" variant="secondary" size="sm" icon={Copy} onClick={copyRegCode}>
              {copied ? "Copied!" : "Copy"}
            </Button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <Input
            label="Batch Number"
            type="number"
            name="batchNumber"
            placeholder="e.g. 12"
            value={batchNumber}
            onChange={(e) => changeBatchNumber(e.target.value)}
          />
          <Select
            label="Program"
            name="program"
            options={[{ value: FIXED_PROGRAM, label: FIXED_PROGRAM }]}
            value={FIXED_PROGRAM}
            disabled
          />
          <Input
            label="Year"
            type="number"
            name="year"
            placeholder="e.g. 2026"
            value={year}
            onChange={(e) => changeYear(e.target.value)}
          />
        </div>
        <div className="mt-3">
          <Input
            label="Batch Code (editable)"
            name="batchCode"
            placeholder="e.g. B12-CODECELIX-2026"
            value={batchCode}
            onChange={(e) => changeBatchCode(e.target.value)}
            error={codeError || undefined}
          />
          <p className="mt-1 text-[12px] text-steel-400">Suggested: {suggestedCode} — edit it freely, it must be unique.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-4">
        <Input
          label="Start date"
          type="date"
          name="startDate"
          value={startDate}
          error={dateErrors.startDate || undefined}
          onChange={(e) => changeStartDate(e.target.value)}
        />
        <div>
          <Input
            label="End date"
            type="date"
            name="endDate"
            value={endDate}
            placeholder="auto: start + 3 months"
            error={dateErrors.endDate || undefined}
            onChange={(e) => changeEndDate(e.target.value)}
          />
          <p className="mt-1 text-[12px] text-steel-400">
            {endDateAuto ? "Auto: 3 months after the start date." : (
              <>
                Defaults to 3 months after the start date.{" "}
                <button
                  type="button"
                  onClick={() => { setEndDateAuto(true); setEndDate(endDateFromStart(startDate)); }}
                  className="font-medium text-brand-600 hover:text-brand-700"
                >
                  Re-apply auto
                </button>
              </>
            )}
          </p>
        </div>
        <Select label="Status" name="status" options={STATUS_OPTIONS} value={status} onChange={(e) => setStatus(e.target.value)} />
        <Select label="Mode" name="mode" options={MODE_OPTIONS} value={mode} onChange={(e) => setMode(e.target.value)} />
      </div>

      <div>
        <p className="mb-2 text-[13px] font-medium text-steel-700">Domains</p>
        <p className="mb-3 text-[12px] text-steel-500">
          Every batch includes the fixed domains below. You can add more custom domains for future use.
        </p>
        <div className="space-y-3">
          {rows.map((domain) => (
            <div
              key={domain.key}
              className="flex flex-col gap-2 rounded-xl border border-steel-200/80 bg-steel-50/50 p-3 sm:flex-row sm:items-end"
            >
              <div className="flex-1">
                <Input
                  label="Domain"
                  aria-label={`Domain ${domain.name || "name"}`}
                  placeholder="e.g. Game Development"
                  value={domain.name}
                  disabled={!domain.custom}
                  onChange={domain.custom ? (e) => updateDomain(domain.key, { name: e.target.value }) : undefined}
                />
                {domain.custom && !domain.name && (
                  <p className="mt-1 text-[12px] text-steel-400">Give this custom domain a name.</p>
                )}
              </div>
              <div className="flex-1">
                <Select
                  label="Team Leader"
                  aria-label={`Team leader for ${domain.name}`}
                  options={leaderOptions}
                  value={domain.teamLeaderId}
                  disabled={memberOptions.length === 0 && !domain.teamLeaderId}
                  onChange={(e) => updateDomain(domain.key, { teamLeaderId: e.target.value })}
                />
              </div>
              {domain.custom && (
                <button
                  type="button"
                  onClick={() => removeCustomDomain(domain.key)}
                  className="inline-flex h-10 w-10 items-center justify-center rounded-lg text-steel-400 transition-colors hover:bg-red-50 hover:text-red-600"
                  aria-label={`Remove domain ${domain.name}`}
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              )}
            </div>
          ))}
        </div>
        <div className="mt-3 flex flex-wrap items-center gap-3">
          <Button type="button" variant="secondary" size="sm" icon={Plus} onClick={addCustomDomain}>
            Add custom domain
          </Button>
          <p className="text-[12px] text-steel-500">
            Custom domains can be added now or later by editing this batch.
          </p>
        </div>
        {!initial && (
          <p className="mt-2 text-[12px] text-steel-500">
            Team leaders can be assigned after the batch is created and internees are enrolled in it.
          </p>
        )}
      </div>

      <div className="sticky -mx-6 -mb-5 bottom-0 flex justify-end gap-2 border-t border-steel-100 bg-white/95 px-6 py-4 backdrop-blur-sm">
        <Button type="button" variant="secondary" onClick={onClose}>
          Cancel
        </Button>
        <Button type="submit" disabled={!valid}>
          {initial ? "Save changes" : "Create batch"}
        </Button>
      </div>
    </form>
  );
}
