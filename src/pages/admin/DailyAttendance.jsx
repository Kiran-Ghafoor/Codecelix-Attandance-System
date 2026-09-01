import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { CalendarDays, CalendarX, FileText, Info, X } from "lucide-react";
import { Card, CardHeader } from "../../components/ui/Card";
import { Table, THead, TRow, TCell } from "../../components/ui/Table";
import Badge from "../../components/ui/Badge";
import Select from "../../components/ui/Select";
import Input from "../../components/ui/Input";
import EmptyState from "../../components/ui/EmptyState";
import Skeleton from "../../components/ui/Skeleton";
import { useBatches } from "../../context/BatchesContext";
import { apiRequest } from "../../lib/api";
import { countByStatus } from "../../lib/reporting";
import { formatDate, formatTime } from "../../lib/format";
import { todayISODate, isValidDateString, isWeekend, getDayName } from "../../lib/dateUtils";

const STATUS_OPTIONS = [
  { value: "all", label: "All statuses" },
  { value: "present", label: "Present" },
  { value: "absent", label: "Absent" },
  { value: "pending", label: "Pending" },
  { value: "off", label: "Off" },
];

const SUMMARY_CHIPS = [
  { status: "present", label: "Present", dot: "bg-emerald-500" },
  { status: "absent", label: "Absent", dot: "bg-red-500" },
  { status: "pending", label: "Pending", dot: "bg-steel-400" },
  { status: "off", label: "Off", dot: "bg-steel-300" },
];

const STATUS_BG = {
  present: "bg-emerald-50/70",
  absent: "bg-red-50/70",
  pending: "bg-steel-50/80",
  off: "bg-steel-100/60",
};

function SkeletonTable() {
  return (
    <Table>
      <THead columns={["Internee", "Submission", "Submitted At", "Status"]} />
      <tbody>
        {Array.from({ length: 6 }).map((_, i) => (
          <TRow key={i}>
            <TCell><Skeleton className="h-4 w-28" /></TCell>
            <TCell><Skeleton className="h-7 w-16 rounded-lg" /></TCell>
            <TCell><Skeleton className="h-4 w-20" /></TCell>
            <TCell><Skeleton className="h-5 w-16 rounded-full" /></TCell>
          </TRow>
        ))}
      </tbody>
    </Table>
  );
}

export default function DailyAttendance() {
  const navigate = useNavigate();
  const { batches } = useBatches();

  const [date, setDate] = useState(todayISODate());
  const [batchId, setBatchId] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);

  const queryDate = isValidDateString(date) ? date : "";

  const batchOptions = useMemo(
    () => [{ value: "all", label: "All batches" }, ...batches.map((b) => ({ value: b.id, label: b.batchCode }))],
    [batches],
  );

  useEffect(() => {
    let cancelled = false;
    async function load() {
      if (!queryDate) {
        setRows([]);
        setLoading(false);
        return;
      }
      setLoading(true);
      const params = new URLSearchParams();
      params.set("date", queryDate);
      if (batchId !== "all") params.set("batchId", batchId);
      try {
        const data = await apiRequest(`/attendance/daily?${params.toString()}`);
        if (!cancelled) setRows(Array.isArray(data.rows) ? data.rows : []);
      } catch {
        if (!cancelled) setRows([]);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => { cancelled = true; };
  }, [queryDate, batchId]);

  const filtered = useMemo(
    () => rows.filter((r) => statusFilter === "all" || r.status === statusFilter),
    [rows, statusFilter],
  );

  const counts = countByStatus(rows);
  const batchName = batchId === "all" ? "All batches" : batches.find((b) => b.id === batchId)?.batchCode;

  const hasActiveFilters = batchId !== "all" || statusFilter !== "all";

  function clearFilters() {
    setBatchId("all");
    setStatusFilter("all");
  }

  return (
    <div className="space-y-5">
      {/* ── Filters ─────────────────────────────────────────────── */}
      <Card>
        <div className="space-y-4">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <Input
              label="Date"
              type="date"
              name="attendanceDate"
              value={date}
              onChange={(e) => setDate(e.target.value)}
            />
            <Select
              label="Batch"
              options={batchOptions}
              value={batchId}
              onChange={(e) => setBatchId(e.target.value)}
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
            subtitle={`${batchName} · ${formatDate(queryDate)} · ${filtered.length} record${filtered.length === 1 ? "" : "s"}`}
          />
        </div>
        <div className="p-5 pt-0 sm:p-6 sm:pt-0">
          {loading ? (
            <SkeletonTable />
          ) : filtered.length > 0 ? (
            <Table>
              <THead columns={["Internee", "Submission", "Submitted At", "Status"]} />
              <tbody>
                {filtered.map((record) => {
                  const bg = STATUS_BG[record.status] || "";
                  return (
                    <TRow key={record.interneeId} className={bg}>
                      <TCell>
                        <Link
                          to={`/admin/internees/${record.interneeId}`}
                          className="font-medium text-steel-800 transition-colors hover:text-brand-700"
                        >
                          {record.internee}
                        </Link>
                      </TCell>
                      <TCell>
                        {record.submissionId ? (
                          <span className="inline-flex items-center gap-1.5 text-[12px]">
                            <FileText className="h-3.5 w-3.5 shrink-0 text-steel-400" />
                            <button
                              onClick={() => navigate(`/admin/submissions/${record.submissionId}`)}
                              className="truncate text-brand-600 underline-offset-2 hover:underline"
                              title={record.submission}
                            >
                              {record.submission}
                            </button>
                          </span>
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
              description="Try another date, or relax the batch or status filter."
              action={
                hasActiveFilters ? (
                  <button onClick={clearFilters} className="text-[13px] font-medium text-brand-600 hover:text-brand-700">
                    Clear filters
                  </button>
                ) : undefined
              }
            />
          )}
        </div>
      </Card>
    </div>
  );
}
