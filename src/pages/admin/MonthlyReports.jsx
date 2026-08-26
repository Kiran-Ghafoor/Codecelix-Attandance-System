import { useMemo, useState, useEffect } from "react";
import { CalendarDays, FileSpreadsheet, Lock, TrendingUp, Users, X } from "lucide-react";
import { Card, CardHeader, StatCard } from "../../components/ui/Card";
import { Table, THead, TRow, TCell } from "../../components/ui/Table";
import Select from "../../components/ui/Select";
import Button from "../../components/ui/Button";
import EmptyState from "../../components/ui/EmptyState";
import Avatar from "../../components/ui/Avatar";
import Skeleton from "../../components/ui/Skeleton";
import { useBatches } from "../../context/BatchesContext";
import {
  ATTENDANCE_RECORDS,
  INTERNEES,
  MOCK_CURRENT_DATE,
  buildDomainIndex,
  getInterneeById,
} from "../../lib/mockData";
import {
  MONTH_NAMES,
  attendancePercent,
  averagePercent,
  countByStatus,
  groupBy,
  monthLabel,
  weekdayLabel,
} from "../../lib/reporting";
import { formatDate } from "../../lib/format";

const MONTH_OPTIONS = MONTH_NAMES.map((name, index) => ({ value: index + 1, label: name }));

function KpiSkeleton() {
  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 xl:grid-cols-5">
      {Array.from({ length: 5 }).map((_, i) => (
        <Card key={i}>
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0 flex-1">
              <Skeleton className="h-3 w-20" />
              <Skeleton className="mt-2.5 h-8 w-16" />
            </div>
            <Skeleton className="h-9 w-9 shrink-0 rounded-lg" />
          </div>
        </Card>
      ))}
    </div>
  );
}

function TableSkeleton({ columns }) {
  return (
    <Table>
      <THead columns={columns} />
      <tbody>
        {Array.from({ length: 5 }).map((_, i) => (
          <TRow key={i}>
            {columns.map((_, ci) => (
              <TCell key={ci}>
                <Skeleton className={`h-4 ${ci === 0 ? "w-32" : ci === columns.length - 1 ? "w-20" : "w-10"}`} />
              </TCell>
            ))}
          </TRow>
        ))}
      </tbody>
    </Table>
  );
}

export default function MonthlyReports() {
  const { batches } = useBatches();
  const [batchId, setBatchId] = useState("all");
  const [month, setMonth] = useState(Number(MOCK_CURRENT_DATE.slice(5, 7)));
  const [year, setYear] = useState(Number(MOCK_CURRENT_DATE.slice(0, 4)));
  const [exportNotice, setExportNotice] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const id = setTimeout(() => setLoading(false), 400);
    return () => clearTimeout(id);
  }, []);

  const selectedKey = `${year}-${String(month).padStart(2, "0")}`;
  const domainIndex = useMemo(() => buildDomainIndex(batches), [batches]);

  const batchOptions = useMemo(
    () => [{ value: "all", label: "All batches" }, ...batches.map((b) => ({ value: b.id, label: b.name }))],
    [batches],
  );

  const yearOptions = useMemo(
    () => [...new Set(ATTENDANCE_RECORDS.map((r) => r.date.slice(0, 4)))].sort().map((y) => ({ value: Number(y), label: y })),
    [],
  );

  const scopeRecords = useMemo(() => {
    return ATTENDANCE_RECORDS.filter((r) => {
      if (!r.date.startsWith(selectedKey) || r.status === "pending") return false;
      if (batchId === "all") return true;
      return getInterneeById(r.interneeId)?.batchId === batchId;
    });
  }, [selectedKey, batchId]);

  const rows = useMemo(() => {
    const inScope = INTERNEES.filter((i) => i.status !== "Completed" && (batchId === "all" || i.batchId === batchId));
    const byInternee = groupBy(scopeRecords, (r) => r.interneeId);
    return inScope
      .map((internee) => {
        const records = byInternee.get(internee.id) ?? [];
        return {
          internee,
          domainName: domainIndex.get(internee.domainId)?.domain.name ?? "—",
          counts: countByStatus(records),
          percent: attendancePercent(countByStatus(records), records.length),
        };
      })
      .sort((a, b) => a.internee.name.localeCompare(b.internee.name));
  }, [scopeRecords, batchId, domainIndex]);

  const days = useMemo(() => {
    const byDate = groupBy(scopeRecords, (r) => r.date);
    return [...byDate.entries()]
      .sort((a, b) => a[0].localeCompare(b[0]))
      .map(([date, records]) => ({
        date,
        counts: countByStatus(records),
        percent: attendancePercent(countByStatus(records), records.length),
      }));
  }, [scopeRecords]);

  const totals = countByStatus(scopeRecords);
  const avgPercent = averagePercent(rows.map((r) => r.percent));
  const batchName = batchId === "all" ? "All batches" : batches.find((b) => b.id === batchId)?.name;

  return (
    <div className="space-y-5">
      {/* ── Filters + Admin Export ──────────────────────────────────── */}
      <Card>
        <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
          {/* Filters */}
          <div className="min-w-0 flex-1">
            <h3 className="font-display text-[13px] font-bold text-steel-800">Report parameters</h3>
            <p className="mt-0.5 text-[12px] text-steel-400">Select a batch and period to view attendance.</p>
            <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-3">
              <Select label="Batch" options={batchOptions} value={batchId} onChange={(e) => setBatchId(e.target.value)} />
              <Select label="Month" options={MONTH_OPTIONS} value={month} onChange={(e) => setMonth(Number(e.target.value))} />
              <Select label="Year" options={yearOptions} value={year} onChange={(e) => setYear(Number(e.target.value))} />
            </div>
          </div>

          {/* Admin-only export */}
          <div className="flex shrink-0 flex-col rounded-xl border border-steel-800 bg-steel-900 p-4 text-white sm:min-w-[260px]">
            <div className="flex items-center gap-2">
              <FileSpreadsheet className="h-4 w-4 text-brand-300" />
              <span className="font-display text-[13px] font-bold">Export report</span>
              <span className="ml-auto inline-flex items-center gap-1 rounded-full bg-white/10 px-2 py-0.5 text-[10px] font-semibold text-steel-300 ring-1 ring-inset ring-white/10">
                <Lock className="h-2.5 w-2.5" />
                Admin
              </span>
            </div>
            <p className="mt-1.5 text-[11px] leading-relaxed text-steel-400">
              Download a server-generated Excel workbook for{" "}
              <span className="font-medium text-steel-200">{batchName}</span> ·{" "}
              <span className="font-medium text-steel-200">{monthLabel(selectedKey)}</span>.
            </p>
            <Button
              icon={FileSpreadsheet}
              className="mt-3 w-full bg-brand-600 text-white hover:bg-brand-500 active:bg-brand-400 shadow-xs shadow-brand-600/30"
              onClick={() => setExportNotice(true)}
            >
              Download Excel
            </Button>
          </div>
        </div>

        {exportNotice && (
          <div className="mt-4 flex items-start gap-2 rounded-lg border border-amber-200/60 bg-amber-50 px-4 py-3 text-[13px] text-amber-800">
            <Lock className="mt-0.5 h-4 w-4 shrink-0" />
            <p className="flex-1">
              Monthly report downloads are restricted to Admin accounts. In production this button requests the
              backend to generate the Excel workbook for {batchName} · {monthLabel(selectedKey)}; this preview stays
              UI-only.
            </p>
            <button onClick={() => setExportNotice(false)} className="shrink-0 rounded p-0.5 text-amber-600 hover:bg-amber-100">
              <X className="h-4 w-4" />
            </button>
          </div>
        )}
      </Card>

      {/* ── KPI Cards ──────────────────────────────────────────────── */}
      {loading ? (
        <KpiSkeleton />
      ) : scopeRecords.length > 0 ? (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 xl:grid-cols-5">
          <StatCard label="Total internees" value={rows.length} icon={Users} tone="brand" />
          <StatCard label="Present" value={totals.present} icon={CalendarDays} tone="green" hint={`${rows.length} total internees`} />
          <StatCard label="Late" value={totals.late} icon={CalendarDays} tone="amber" hint={`${totals.excused} excused`} />
          <StatCard label="Absent" value={totals.absent} icon={CalendarDays} tone="red" hint={`${totals.excused} excused`} />
          <StatCard
            label="Attendance %"
            value={avgPercent !== null ? `${avgPercent}%` : "—"}
            icon={TrendingUp}
            tone={avgPercent !== null && avgPercent >= 85 ? "green" : avgPercent !== null && avgPercent >= 70 ? "amber" : "red"}
            hint={`${days.length} working days`}
          />
        </div>
      ) : null}

      {/* ── Results ─────────────────────────────────────────────────── */}
      {loading ? (
        <>
          <Card padded={false}>
            <div className="px-5 pt-5 pb-0 sm:px-6">
              <CardHeader title="Monthly attendance summary" subtitle={`${batchName} · ${monthLabel(selectedKey)}`} />
            </div>
            <div className="p-5 pt-0 sm:p-6 sm:pt-0">
              <TableSkeleton columns={["Internee", "Domain", "Present", "Late", "Absent", "Excused", "Attendance %"]} />
            </div>
          </Card>
          <Card padded={false}>
            <div className="px-5 pt-5 pb-0 sm:px-6">
              <CardHeader title={`Daily attendance — ${monthLabel(selectedKey)}`} subtitle={`Per-day totals for ${batchName}`} />
            </div>
            <div className="p-5 pt-0 sm:p-6 sm:pt-0">
              <TableSkeleton columns={["Date", "Day", "Present", "Late", "Absent", "Excused", "Attendance %"]} />
            </div>
          </Card>
        </>
      ) : scopeRecords.length === 0 ? (
        <Card padded={false}>
          <div className="p-8">
            <EmptyState
              icon={CalendarDays}
              title={`No attendance records for ${monthLabel(selectedKey)}`}
              description="Choose another month, year or batch — or wait until the server finalizes more days."
            />
          </div>
        </Card>
      ) : (
        <>
          {/* ── Monthly attendance summary ─────────────────────────── */}
          <Card padded={false}>
            <div className="px-5 pt-5 pb-0 sm:px-6">
              <CardHeader title="Monthly attendance summary" subtitle={`${batchName} · ${monthLabel(selectedKey)} · ${rows.length} internees`} />
            </div>
            <div className="p-5 pt-0 sm:p-6 sm:pt-0">
              <Table>
                <THead columns={["Internee", "Domain", "Present", "Late", "Absent", "Excused", "Attendance %"]} />
                <tbody>
                  {rows.map(({ internee, domainName, counts, percent }) => (
                    <TRow key={internee.id}>
                      <TCell>
                        <span className="inline-flex items-center gap-2.5">
                          <Avatar person={internee} size="h-7 w-7 text-[10px]" />
                          <span className="font-medium text-steel-800">{internee.name}</span>
                        </span>
                      </TCell>
                      <TCell>{domainName}</TCell>
                      <TCell className="text-emerald-700">{counts.present}</TCell>
                      <TCell className="text-amber-700">{counts.late}</TCell>
                      <TCell className="text-red-700">{counts.absent}</TCell>
                      <TCell className="text-sky-700">{counts.excused}</TCell>
                      <TCell>
                        <PercentCell value={percent} />
                      </TCell>
                    </TRow>
                  ))}
                </tbody>
              </Table>
              <p className="mt-3 text-[12px] text-steel-400">
                Late days count as attended; excused days are excluded from the percentage. The backend remains the
                source of truth for official figures and exports.
              </p>
            </div>
          </Card>

          {/* ── Daily attendance breakdown ─────────────────────────── */}
          <Card padded={false}>
            <div className="px-5 pt-5 pb-0 sm:px-6">
              <CardHeader
                title={`Daily attendance — ${monthLabel(selectedKey)}`}
                subtitle={`Per-day totals for ${batchName}`}
              />
            </div>
            <div className="p-5 pt-0 sm:p-6 sm:pt-0">
              <Table>
                <THead columns={["Date", "Day", "Present", "Late", "Absent", "Excused", "Attendance %"]} />
                <tbody>
                  {days.map(({ date, counts, percent }) => (
                    <TRow key={date}>
                      <TCell className="font-medium text-steel-800">{formatDate(date)}</TCell>
                      <TCell>{weekdayLabel(date)}</TCell>
                      <TCell className="text-emerald-700">{counts.present}</TCell>
                      <TCell className="text-amber-700">{counts.late}</TCell>
                      <TCell className="text-red-700">{counts.absent}</TCell>
                      <TCell className="text-sky-700">{counts.excused}</TCell>
                      <TCell>
                        <PercentCell value={percent} />
                      </TCell>
                    </TRow>
                  ))}
                </tbody>
              </Table>
            </div>
          </Card>
        </>
      )}
    </div>
  );
}

function PercentCell({ value }) {
  if (value === null || value === undefined) return <span className="text-steel-300">—</span>;
  const tone = value >= 85 ? "bg-emerald-500" : value >= 70 ? "bg-amber-500" : "bg-red-500";
  return (
    <span className="inline-flex items-center gap-2">
      <span aria-hidden="true" className="h-1.5 w-20 overflow-hidden rounded-full bg-steel-100">
        <span className={`block h-full rounded-full ${tone}`} style={{ width: `${value}%` }} />
      </span>
      <span className="w-10 text-right font-medium text-steel-800">{value}%</span>
    </span>
  );
}
