import { useMemo, useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import Modal from "../ui/Modal";
import Button from "../ui/Button";
import Input from "../ui/Input";
import Select from "../ui/Select";
import { useInternees } from "../../context/InterneesContext";
import { buildBatchFormSnapshot, comparableDomains, generateBatchCode, isBatchFormSaveable } from "../../lib/batchForm";
import { getDateError, isDateRangeValid } from "../../lib/dateUtils";

const STATUS_OPTIONS = [
  { value: "Active", label: "Active" },
  { value: "Upcoming", label: "Upcoming" },
  { value: "Inactive", label: "Inactive" },
];

const PROGRAM_OPTIONS = [
  { value: "", label: "Select program" },
  { value: "COURSERA", label: "Coursera" },
  { value: "UDEMY", label: "Udemy" },
  { value: "INTERNSHALA", label: "Internshala" },
  { value: "INTERNAL", label: "Internal" },
];

let rowSeq = 0;

function emptyDomainRow() {
  rowSeq += 1;
  return { key: `dom-row-${rowSeq}`, id: null, name: "", teamLeaderId: "" };
}

function toDomainRows(batch) {
  if (!batch?.domains?.length) return [emptyDomainRow()];
  return batch.domains.map((d) => {
    rowSeq += 1;
    return { key: `dom-row-${rowSeq}`, id: d.id, name: d.name, teamLeaderId: d.teamLeaderId || "" };
  });
}

export default function BatchFormModal({ open, onClose, title, initial = null, onSubmit, isDuplicateCode }) {
  return (
    <Modal open={open} onClose={onClose} title={title} size="xl">
      {open && <BatchForm key={initial?.id ?? "new"} initial={initial} onClose={onClose} onSubmit={onSubmit} isDuplicateCode={isDuplicateCode} />}
    </Modal>
  );
}

function BatchForm({ initial, onClose, onSubmit, isDuplicateCode }) {
  const { internees } = useInternees();
  const [batchNumber, setBatchNumber] = useState(initial?.batchNumber ?? 0);
  const [program, setProgram] = useState(initial?.program ?? "");
  const [year, setYear] = useState(initial?.year ?? new Date().getFullYear());
  const [startDate, setStartDate] = useState(initial?.startDate ?? "");
  const [endDate, setEndDate] = useState(initial?.endDate ?? "");
  const [status, setStatus] = useState(initial?.status ?? "Active");
  const [rows, setRows] = useState(() => toDomainRows(initial));
  const [dateErrors, setDateErrors] = useState({});
  const [codeError, setCodeError] = useState("");
  const snapshot = useMemo(() => buildBatchFormSnapshot(initial, rows), []);

  const memberOptions = useMemo(
    () => (initial?.id ? internees.filter((i) => i.batchId === initial.id) : []),
    [internees, initial]
  );
  const leaderOptions = [
    { value: "", label: memberOptions.length > 0 ? "Select team leader" : "No internees in this batch yet" },
    ...memberOptions.map((i) => ({ value: i.id, label: i.name })),
  ];

  const batchCodePreview = generateBatchCode(batchNumber, program || "PROGRAM", year);

  function handleCodeChange(num, prog, yr) {
    const code = generateBatchCode(num, prog || "PROGRAM", yr);
    if (isDuplicateCode && isDuplicateCode(code, initial?.id)) {
      setCodeError(`"${code}" already exists.`);
    } else {
      setCodeError("");
    }
  }

  function changeBatchNumber(val) {
    const num = parseInt(val, 10);
    setBatchNumber(isNaN(num) ? 0 : num);
    handleCodeChange(isNaN(num) ? 0 : num, program, year);
  }

  function changeProgram(val) {
    setProgram(val);
    handleCodeChange(batchNumber, val, year);
  }

  function changeYear(val) {
    const yr = parseInt(val, 10);
    setYear(isNaN(yr) ? new Date().getFullYear() : yr);
    handleCodeChange(batchNumber, program, isNaN(yr) ? new Date().getFullYear() : yr);
  }

  function changeStartDate(value) {
    setStartDate(value);
    setDateErrors((prev) => ({
      ...prev,
      startDate: getDateError(value, { required: true }),
      endDate: isDateRangeValid(value, endDate) ? null : prev.endDate,
    }));
  }

  function changeEndDate(value) {
    setEndDate(value);
    setDateErrors((prev) => ({
      ...prev,
      endDate: value && !isDateRangeValid(startDate, value) ? "End date can't be before the start date." : getDateError(value),
    }));
  }

  function updateDomain(key, patch) {
    setRows((prev) => prev.map((d) => (d.key === key ? { ...d, ...patch } : d)));
  }

  function removeDomain(key) {
    setRows((prev) => (prev.length > 1 ? prev.filter((d) => d.key !== key) : prev));
  }

  const form = { batchNumber, program, year, startDate, endDate, status, rows };
  const valid = isBatchFormSaveable(form, snapshot) && !codeError;
  const blockedByNames = comparableDomains(rows).some((d) => d.name.length === 0);

  function handleSubmit(event) {
    event.preventDefault();
    if (!valid) return;
    onSubmit({
      batchNumber,
      program: program.trim(),
      year,
      startDate,
      endDate,
      status,
      domains: comparableDomains(rows),
    });
    onClose();
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="rounded-xl border border-steel-200/60 bg-steel-50/50 p-4">
        <p className="mb-3 text-[12px] font-medium uppercase tracking-wide text-steel-400">Batch Identity</p>
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
            options={PROGRAM_OPTIONS}
            value={program}
            onChange={(e) => changeProgram(e.target.value)}
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
        <div className="mt-3 rounded-lg border border-steel-200/60 bg-white px-3 py-2">
          <p className="text-[12px] text-steel-400">Batch Code</p>
          <p className="font-display text-[15px] font-bold text-steel-800">{batchCodePreview}</p>
          {codeError && <p className="mt-1 text-[12px] text-red-500">{codeError}</p>}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <Input
          label="Start date"
          type="date"
          name="startDate"
          value={startDate}
          error={dateErrors.startDate || undefined}
          onChange={(e) => changeStartDate(e.target.value)}
        />
        <Input
          label="End date"
          type="date"
          name="endDate"
          value={endDate}
          error={dateErrors.endDate || undefined}
          onChange={(e) => changeEndDate(e.target.value)}
        />
        <Select label="Status" name="status" options={STATUS_OPTIONS} value={status} onChange={(e) => setStatus(e.target.value)} />
      </div>

      <div>
        <p className="mb-2 text-[13px] font-medium text-steel-700">Domains</p>
        <div className="space-y-3">
          {rows.map((domain, index) => (
            <div key={domain.key} className="flex flex-col gap-2 rounded-xl border border-steel-200/80 bg-steel-50/50 p-3 sm:flex-row sm:items-end">
              <div className="flex-1">
                <Input
                  label={`Domain ${index + 1}`}
                  placeholder="e.g. AI"
                  aria-label={`Domain ${index + 1} name`}
                  value={domain.name}
                  onChange={(e) => updateDomain(domain.key, { name: e.target.value })}
                />
              </div>
              <div className="flex-1">
                <Select
                  label="Team Leader"
                  aria-label={`Team leader for domain ${index + 1}`}
                  options={leaderOptions}
                  value={domain.teamLeaderId}
                  disabled={memberOptions.length === 0}
                  onChange={(e) => updateDomain(domain.key, { teamLeaderId: e.target.value })}
                />
              </div>
              <Button
                type="button"
                variant="danger"
                size="md"
                icon={Trash2}
                aria-label={`Remove domain ${index + 1}`}
                disabled={rows.length === 1}
                onClick={() => removeDomain(domain.key)}
                className="shrink-0"
              >
                Remove
              </Button>
            </div>
          ))}
        </div>
        <Button
          type="button"
          variant="secondary"
          size="sm"
          icon={Plus}
          className="mt-3"
          onClick={() => setRows((prev) => [...prev, emptyDomainRow()])}
        >
          Add domain
        </Button>
        {blockedByNames && (
          <p className="mt-2 text-[12px] text-amber-600">Every domain row needs a name before the form can be saved.</p>
        )}
        {!initial && (
          <p className="mt-2 text-[12px] text-steel-500">
            Team leaders can be assigned after the batch is created and internees are enrolled in it.
          </p>
        )}
      </div>

      <div className="flex justify-end gap-2 border-t border-steel-100 pt-4">
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
