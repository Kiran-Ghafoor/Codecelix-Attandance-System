import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { CalendarDays, CalendarX, FileText, Info, X } from "lucide-react";
import { Card, CardHeader } from "../../components/ui/Card";
import { Table, THead, TRow, TCell } from "../../components/ui/Table";
import Badge from "../../components/ui/Badge";
import Select from "../../components/ui/Select";
import Input from "../../components/ui/Input";
import Button from "../../components/ui/Button";
import EmptyState from "../../components/ui/EmptyState";
import Avatar from "../../components/ui/Avatar";
import Skeleton from "../../components/ui/Skeleton";
import { useBatches } from "../../context/BatchesContext";
import {
  MOCK_CURRENT_DATE,
  buildDomainIndex,
  getInterneeById,
  getSubmissionById,
  getAttendanceByDate,
  getLatestFinalizedDate,
} from "../../lib/mockData";
import { countByStatus } from "../../lib/reporting";
import { formatDate, formatTime } from "../../lib/format";
import { isValidDateString, isWeekend, getDayName } from "../../lib/dateUtils";

const STATUS_OPTIONS = [
  { value: "all", label: "All statuses" },
  { value: "present", label: "Present" },
  { value: "late", label: "Late" },
  { value: "absent", label: "Absent" },
  { value: "excused", label: "Excused" },
  { value: "pending", label: "Pending" },
  { value: "off", label: "Off" },
];

const SUMMARY_CHIPS = [
  { status: "present", label: "Present", dot: "bg-emerald-500" },
  { status: "late", label: "Late", dot: "bg-amber-500" },
  { status: "absent", label: "Absent", dot: "bg-red-500" },
  { status: "excused", label: "Excused", dot: "bg-sky-500" },
  { status: "pending", label: "Pending", dot: "bg-steel-400" },
  { status: "off", label: "Off", dot: "bg-steel-300" },
];

function SkeletonTable() {
  return (
    <Table>
      <THead columns={["Internee", "Domain", "Submission", "Submitted At", "Status"]} />
      <tbody>
        {Array.from({ length: 6 }).map((_, i) => (
          <TRow key={i}>
            <TCell>
              <div className="flex items-center gap-2">
                <Skeleton className="h-7 w-7 shrink-0 rounded-full" />
                <Skeleton className="h-4 w-28" />
              </div>
            </TCell>
            <TCell><Skeleton className="h-4 w-24" /></TCell>
            <TCell><Skeleton className="h-7 w-16 rounded-lg" /></TCell>
            <TCell><Skeleton className="h-4 w-20" /></TCell>
            <TCell><Skeleton className="h-5 w-16 rounded-full" /></TCell>
          </TRow>
        ))}
      </tbody>
    </Table>
  );
}

const STATUS_BG = {
  present: "bg-emerald-50/70",
  late: "bg-amber-50/70",
  absent: "bg-red-50/70",
  excused: "bg-sky-50/50",
  pending: "bg-steel-50/80",
  off: "bg-steel-100/60",
};

export default function DailyAttendance() {
  const navigate = useNavigate();
  const { batches } = useBatches();

  const [date, setDate] = useState(() => getLatestFinalizedDate() ?? MOCK_CURRENT_DATE);
  const [batchId, setBatchId] = useState("all");
  const [domainId, setDomainId] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const id = setTimeout(() => setLoading(false), 400);
    return () => clearTimeout(id);
  }, []);

  const domainIndex = useMemo(() => buildDomainIndex(batches), [batches]);
  const queryDate = isValidDateString(date) ? date : "";

  const batchOptions = useMemo(
    () => [{ value: "all", label: "All batches" }, ...batches.map((b) => ({ value: b.id, label: b.name }))],
    [batches],
  );

  const domainOptions = useMemo(() => {
    const source = batchId === "all" ? batches : batches.filter((b) => b.id === batchId);
    const unique = new Map();
    source.forEach((b) => (b.domains ?? []).forEach((d) => !unique.has(d.id) && unique.set(d.id, d.name)));
    return [{ value: "all", label: "All domains" }, ...[...unique].map(([id, name]) => ({ value: id, label: name }))];
  }, [batchId, batches]);

  function handleBatchChange(nextBatch) {
    setBatchId(nextBatch);
    setDomainId("all");
  }

  const rows = useMemo(() => {
    if (!queryDate) return [];
    return getAttendanceByDate(queryDate)
      .filter((r) => {
        const internee = getInterneeById(r.interneeId);
        const matchesBatch = batchId === "all" || internee?.batchId === batchId;
        const matchesDomain = domainId === "all" || internee?.domainId === domainId;
        const matchesStatus = statusFilter === "all" || r.status === statusFilter;
        return matchesBatch && matchesDomain && matchesStatus;
      })
      .sort((a, b) =>
        (getInterneeById(a.interneeId)?.name ?? "").localeCompare(getInterneeById(b.interneeId)?.name ?? ""),
      );
  }, [queryDate, batchId, domainId, statusFilter]);

  const counts = countByStatus(rows);
  const batchName = batchId === "all" ? "All batches" : batches.find((b) => b.id === batchId)?.name;

  const hasActiveFilters = batchId !== "all" || domainId !== "all" || statusFilter !== "all";

  function clearFilters() {
    setBatchId("all");
    setDomainId("all");
    setStatusFilter("all");
  }

  return (
    <div className="space-y-5">
      {/* ── Filters ─────────────────────────────────────────────── */}
      <Card>
        <div className="space-y-4">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <Input
              label="Date"
              type="date"
              name="attendanceDate"
              max={MOCK_CURRENT_DATE}
              value={date}
              onChange={(e) => setDate(e.target.value)}
            />
            <Select
              label="Batch"
              options={batchOptions}
              value={batchId}
              onChange={(e) => handleBatchChange(e.target.value)}
            />
            <Select
              label="Domain"
              options={domainOptions}
              value={domainId}
              onChange={(e) => setDomainId(e.target.value)}
            />
            <Select
              label="Status"
              options={STATUS_OPTIONS}
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            />
          </div>

          {hasActiveFilters && (
            <div className="flex items-center gap-2 border-t border-steel-100 pt-3">
              <span className="text-[12px] font-medium text-steel-400">Filters active</span>
              <button
                onClick={clearFilters}
                className="inline-flex items-center gap-1 rounded-md px-1.5 py-0.5 text-[12px] font-medium text-brand-600 transition-colors hover:bg-brand-50 hover:text-brand-700"
              >
                <X className="h-3 w-3" /> Clear
              </button>
            </div>
          )}
        </div>
      </Card>

      {/* ── Summary Chips ───────────────────────────────────────── */}
      <div className="flex flex-wrap gap-2">
        {SUMMARY_CHIPS.map((chip) => {
          const active = statusFilter === chip.status;
          const hasCount = counts[chip.status] > 0;
          return (
            <button
              key={chip.status}
              onClick={() => setStatusFilter((prev) => (prev === chip.status ? "all" : chip.status))}
              className={`inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-[12px] font-medium shadow-xs transition-all duration-150 ${
                active
                  ? "border-brand-200 bg-brand-50 text-brand-700 ring-2 ring-brand-500/20"
                  : hasCount
                    ? "border-steel-200/60 bg-white text-steel-700 hover:border-steel-300 hover:bg-steel-50"
                    : "border-steel-100 bg-white text-steel-300 cursor-default"
              }`}
            >
              <span
                aria-hidden="true"
                className={`h-1.5 w-1.5 rounded-full ${hasCount || active ? chip.dot : "bg-steel-200"}`}
              />
              {chip.label}
              <span className={`tabular-nums ${active ? "text-brand-600" : "text-steel-400"}`}>
                {counts[chip.status]}
              </span>
            </button>
          );
        })}
      </div>

      {/* ── Weekend notice ──────────────────────────────────────── */}
      {isValidDateString(queryDate) && isWeekend(queryDate) && (
        <div className="flex items-start gap-3 rounded-lg border border-steel-200/60 bg-steel-50 px-4 py-3 text-[13px] text-steel-600">
          <Info className="mt-0.5 h-4 w-4 shrink-0 text-steel-400" />
          <p>
            <span className="font-medium text-steel-700">{getDayName(queryDate)}</span> is a weekend — all internees
            are marked <Badge status="off" /> and submissions are closed.
          </p>
        </div>
      )}

      {/* ── Attendance Table ────────────────────────────────────── */}
      <Card padded={false}>
        <div className="px-5 pt-5 pb-0 sm:px-6">
          <CardHeader
            title="Daily attendance"
            subtitle={`${batchName} · ${formatDate(queryDate)} · ${rows.length} record${rows.length === 1 ? "" : "s"}`}
          />
        </div>
        <div className="p-5 pt-0 sm:p-6 sm:pt-0">
          {loading ? (
            <SkeletonTable />
          ) : rows.length > 0 ? (
            <Table>
              <THead columns={["Internee", "Domain", "Submission", "Submitted At", "Status"]} />
              <tbody>
                {rows.map((record) => {
                  const internee = getInterneeById(record.interneeId);
                  const submission = record.submissionId ? getSubmissionById(record.submissionId) : null;
                  const bg = STATUS_BG[record.status] || "";
                  return (
                    <TRow key={record.id} className={bg}>
                      <TCell>
                        {internee && (
                          <span className="inline-flex items-center gap-2.5">
                            <Avatar person={internee} size="h-7 w-7 text-[10px]" />
                            <Link
                              to={`/admin/internees/${internee.id}`}
                              className="font-medium text-steel-800 transition-colors hover:text-brand-700"
                            >
                              {internee.name}
                            </Link>
                          </span>
                        )}
                      </TCell>
                      <TCell className="text-steel-600">
                        {domainIndex.get(internee?.domainId)?.domain.name ?? <span className="text-steel-300">—</span>}
                      </TCell>
                      <TCell>
                        {submission ? (
                          <Button
                            variant="secondary"
                            size="sm"
                            icon={FileText}
                            onClick={() => navigate(`/admin/submissions/${submission.id}`)}
                          >
                            View
                          </Button>
                        ) : (
                          <span className="text-steel-300">—</span>
                        )}
                      </TCell>
                      <TCell className="tabular-nums text-steel-500">
                        {record.submittedAt ? (
                          <span className="font-medium">{formatTime(record.submittedAt)}</span>
                        ) : (
                          <span className="text-steel-300">—</span>
                        )}
                      </TCell>
                      <TCell>
                        <Badge status={record.status} />
                      </TCell>
                    </TRow>
                  );
                })}
              </tbody>
            </Table>
          ) : !queryDate ? (
            <EmptyState
              icon={CalendarDays}
              title="Pick a date to begin"
              description="Select a date above to view attendance records for that day."
            />
          ) : (
            <EmptyState
              icon={CalendarX}
              title="No records for this selection"
              description="Try another date, or relax the batch, domain or status filter."
              action={
                hasActiveFilters ? (
                  <Button variant="secondary" icon={X} onClick={clearFilters}>
                    Clear filters
                  </Button>
                ) : undefined
              }
            />
          )}
        </div>
      </Card>
    </div>
  );
}
