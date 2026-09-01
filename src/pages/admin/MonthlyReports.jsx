import { useMemo, useState, useEffect } from "react";
import { CalendarDays, FileSpreadsheet, TrendingUp } from "lucide-react";
import { Card, CardHeader, StatCard } from "../../components/ui/Card";
import Select from "../../components/ui/Select";
import Button from "../../components/ui/Button";
import EmptyState from "../../components/ui/EmptyState";
import Skeleton from "../../components/ui/Skeleton";
import { useBatches } from "../../context/BatchesContext";
import { MONTH_NAMES, monthLabel } from "../../lib/reporting";
import { formatDate } from "../../lib/format";
import { apiDownload, apiRequest } from "../../lib/api";
import { todayISODate } from "../../lib/dateUtils";

const MONTH_OPTIONS = MONTH_NAMES.map((name, index) => ({ value: index + 1, label: name }));

function KpiSkeleton() {
  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 xl:grid-cols-4">
      {Array.from({ length: 4 }).map((_, i) => (
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

function MatrixSkeleton({ dayCount }) {
  return (
    <div className="space-y-3">
      {Array.from({ length: 5 }).map((_, i) => (
        <div key={i} className="flex items-center gap-3 rounded-lg border border-steel-100 px-3 py-2.5">
          <Skeleton className="h-4 w-32" />
          {Array.from({ length: Math.min(dayCount, 10) }).map((_, ci) => (
            <Skeleton key={ci} className="h-4 w-5" />
          ))}
          <Skeleton className="h-4 w-14" />
        </div>
      ))}
    </div>
  );
}

export default function MonthlyReports() {
  const { batches } = useBatches();
  const today = todayISODate();
  const [batchId, setBatchId] = useState("all");
  const [month, setMonth] = useState(Number(today.slice(5, 7)));
  const [year, setYear] = useState(Number(today.slice(0, 4)));
  const [exporting, setExporting] = useState(false);
  const [downloaded, setDownloaded] = useState(false);
  const [loading, setLoading] = useState(true);
  const [report, setReport] = useState(null);

  const batchOptions = useMemo(
    () => [{ value: "all", label: "All batches" }, ...batches.map((b) => ({ value: b.id, label: b.batchCode }))],
    [batches],
  );

  const yearOptions = useMemo(() => {
    const current = Number(today.slice(0, 4));
    const years = [];
    for (let y = current - 2; y <= current + 1; y += 1) years.push({ value: y, label: String(y) });
    return years;
  }, [today]);

  const selectedKey = `${year}-${String(month).padStart(2, "0")}`;

  useEffect(() => {
    let cancelled = false;
    async function load() {
      setLoading(true);
      setReport(null);
      const params = new URLSearchParams();
      if (batchId !== "all") params.set("batchId", batchId);
      params.set("month", String(month));
      params.set("year", String(year));
      try {
        const data = await apiRequest(`/reports/monthly?${params.toString()}`);
        if (!cancelled) setReport(data);
      } catch {
        if (!cancelled) setReport(null);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => { cancelled = true; };
  }, [batchId, month, year]);

  async function handleExport() {
    setExporting(true);
    const params = new URLSearchParams();
    if (batchId !== "all") params.set("batchId", batchId);
    params.set("month", String(month));
    params.set("year", String(year));
    try {
      const blob = await apiDownload(`/reports/monthly/export?${params.toString()}`);
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      const batchPart = (report?.batchName ?? "All_batches").replace(/\s+/g, "_");
      a.href = url;
      a.download = `codecelix-attendance-${batchPart}-${year}-${String(month).padStart(2, "0")}.xlsx`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
      setDownloaded(true);
    } catch {
      /* apiDownload threw; keep exporting state reset below */
    } finally {
      setExporting(false);
    }
  }

  const totals = report?.totals ?? { present: 0, absent: 0 };
  const avgPercent = report?.avgPercent ?? null;
  const students = report?.students ?? [];
  const days = report?.dates?.filter((d) => !d.isWeekend) ?? [];
  const internCount = report?.internCount ?? 0;
  const batchName = report?.batchName ?? (batchId === "all" ? "All batches" : batches.find((b) => b.id === batchId)?.batchCode);
  const hasData = students.length > 0;

  return (
    <div className="space-y-5">
      {/* ── Filters + Admin Export ──────────────────────────────────── */}
      <Card>
        <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
          <div className="min-w-0 flex-1">
            <h3 className="font-display text-[13px] font-bold text-steel-800">Report parameters</h3>
            <p className="mt-0.5 text-[12px] text-steel-400">Select a batch and period to view attendance.</p>
            <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-3">
              <Select label="Batch" options={batchOptions} value={batchId} onChange={(e) => setBatchId(e.target.value)} />
              <Select label="Month" options={MONTH_OPTIONS} value={month} onChange={(e) => setMonth(Number(e.target.value))} />
              <Select label="Year" options={yearOptions} value={year} onChange={(e) => setYear(Number(e.target.value))} />
            </div>
          </div>

          <div className="flex shrink-0 flex-col rounded-xl border border-steel-200/60 bg-white p-4 shadow-card sm:min-w-[260px]">
            <div className="flex items-center gap-2">
              <FileSpreadsheet className="h-4 w-4 text-brand-600" />
              <span className="font-display text-[13px] font-bold text-steel-800">Export report</span>
            </div>
            <p className="mt-1.5 text-[11px] leading-relaxed text-steel-400">
              Download an Excel workbook for{" "}
              <span className="font-medium text-steel-600">{batchName}</span> ·{" "}
              <span className="font-medium text-steel-600">{monthLabel(selectedKey)}</span>.
            </p>
            <Button
              icon={FileSpreadsheet}
              className="mt-3 w-full"
              loading={exporting}
              disabled={!hasData}
              onClick={handleExport}
            >
              Download Excel
            </Button>
            {!hasData && <p className="mt-2 text-[11px] text-amber-600">No records for this period.</p>}
            {downloaded && (
              <p className="mt-2 text-[11px] text-green-600">Workbook downloaded. You can download again anytime.</p>
            )}
          </div>
        </div>
      </Card>

      {/* ── KPI Cards ──────────────────────────────────────────────── */}
      {loading ? (
        <KpiSkeleton />
      ) : hasData ? (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 xl:grid-cols-4">
          <StatCard label="Total internees" value={internCount} icon={CalendarDays} tone="brand" />
          <StatCard label="Present" value={totals.present} icon={CalendarDays} tone="green" hint={`${internCount} total internees`} />
          <StatCard label="Absent" value={totals.absent} icon={CalendarDays} tone="red" hint={`${internCount} total internees`} />
          <StatCard
            label="Average attendance %"
            value={avgPercent !== null ? `${avgPercent}%` : "—"}
            icon={TrendingUp}
            tone={avgPercent !== null && avgPercent >= 85 ? "green" : avgPercent !== null && avgPercent >= 70 ? "amber" : "red"}
            hint={`${days.length} working days`}
          />
        </div>
      ) : null}

      {/* ── Matrix ─────────────────────────────────────────────────── */}
      {loading ? (
        <Card padded={false}>
          <div className="px-5 pt-5 pb-0 sm:px-6">
            <CardHeader title={`Monthly attendance — ${monthLabel(selectedKey)}`} subtitle={`${batchName} · P = Present, A = Absent`} />
          </div>
          <div className="p-5 pt-0 sm:p-6 sm:pt-0">
            <MatrixSkeleton dayCount={days.length} />
          </div>
        </Card>
      ) : !hasData ? (
        <Card padded={false}>
          <div className="p-8">
            <EmptyState
              icon={CalendarDays}
              title={`No attendance records for ${monthLabel(selectedKey)}`}
              description="Choose another month, year or batch — the reported figures come straight from stored attendance records."
            />
          </div>
        </Card>
      ) : (
        <Card padded={false}>
          <div className="flex flex-wrap items-center justify-between gap-3 px-5 pt-5 sm:px-6">
            <CardHeader
              title={`Monthly attendance — ${monthLabel(selectedKey)}`}
              subtitle={`${batchName} · ${students.length} internees · ${days.length} working days · weekends are off`}
            />
            <div className="flex items-center gap-3 text-[12px] text-steel-500">
              <span className="inline-flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-full bg-emerald-500" /> Present
              </span>
              <span className="inline-flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-full bg-red-500" /> Absent
              </span>
            </div>
          </div>
          <div className="overflow-x-auto p-5 pt-3 sm:p-6 sm:pt-3">
            <table className="w-full min-w-max border-collapse text-[12px]">
              <thead>
                <tr>
                  <th className="sticky left-0 z-10 border border-steel-200 bg-steel-50 px-2.5 py-2 text-left font-semibold text-steel-700">
                    #
                  </th>
                  <th className="sticky left-[28px] z-10 border border-steel-200 bg-steel-50 px-3 py-2 text-left font-semibold text-steel-700">
                    Internee
                  </th>
                  <th className="border border-steel-200 bg-steel-50 px-3 py-2 text-left font-semibold text-steel-700">
                    Domain
                  </th>
                  {days.map((d) => (
                    <th
                      key={d.date}
                      title={formatDate(d.date)}
                      className="border border-steel-200 bg-steel-50 px-1 py-2 text-center font-semibold text-steel-600"
                    >
                      <span className="block">{d.day}</span>
                      <span className="block text-[10px] font-medium text-steel-400">{d.weekday}</span>
                    </th>
                  ))}
                  <th className="border border-steel-200 bg-steel-50 px-3 py-2 text-center font-semibold text-emerald-700">
                    Present
                  </th>
                  <th className="border border-steel-200 bg-steel-50 px-3 py-2 text-center font-semibold text-red-700">
                    Absent
                  </th>
                  <th className="border border-steel-200 bg-steel-50 px-3 py-2 text-right font-semibold text-steel-700">
                    Attendance %
                  </th>
                </tr>
              </thead>
              <tbody>
                {students.map((student, i) => (
                  <tr key={student.internee} className="bg-white hover:bg-steel-50/60">
                    <td className="sticky left-0 z-10 border border-steel-100 bg-white px-2.5 py-1.5 text-center text-steel-400">
                      {i + 1}
                    </td>
                    <td className="sticky left-[28px] z-10 border border-steel-100 bg-white px-3 py-1.5 font-medium text-steel-800">
                      {student.internee}
                    </td>
                    <td className="border border-steel-100 px-3 py-1.5 text-steel-500">{student.domain}</td>
                    {days.map((d) => {
                      const v = student.dayStatus?.[d.date];
                      return (
                        <td key={d.date} className="border border-steel-100 px-1 py-1.5 text-center">
                          {v ? (
                            <span
                              className={`font-bold ${v === "P" ? "text-emerald-600" : "text-red-500"}`}
                            >
                              {v}
                            </span>
                          ) : (
                            <span className="text-steel-200">·</span>
                          )}
                        </td>
                      );
                    })}
                    <td className="border border-steel-100 px-3 py-1.5 text-center font-medium text-emerald-700">
                      {student.present}
                    </td>
                    <td className="border border-steel-100 px-3 py-1.5 text-center font-medium text-red-700">
                      {student.absent}
                    </td>
                    <td className="border border-steel-100 px-3 py-1.5 text-right font-semibold text-steel-800">
                      {student.percent === null ? "—" : `${student.percent}%`}
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr>
                  <td className="sticky left-0 z-10 border border-steel-200 bg-steel-50 px-2.5 py-2" />
                  <td className="sticky left-[28px] z-10 border border-steel-200 bg-steel-50 px-3 py-2 font-semibold text-steel-800">
                    TOTAL
                  </td>
                  <td className="border border-steel-200 bg-steel-50 px-3 py-2" />
                  {days.map((d) => {
                    const presentCount = students.reduce((sum, s) => sum + (s.dayStatus?.[d.date] === "P" ? 1 : 0), 0);
                    return (
                      <td key={d.date} className="border border-steel-200 bg-steel-50 px-1 py-2 text-center font-medium text-steel-600">
                        {presentCount}
                      </td>
                    );
                  })}
                  <td className="border border-steel-200 bg-steel-50 px-3 py-2 text-center font-semibold text-emerald-700">
                    {totals.present}
                  </td>
                  <td className="border border-steel-200 bg-steel-50 px-3 py-2 text-center font-semibold text-red-700">
                    {totals.absent}
                  </td>
                  <td className="border border-steel-200 bg-steel-50 px-3 py-2 text-right font-semibold text-steel-800">
                    {avgPercent === null ? "—" : `${avgPercent}%`}
                  </td>
                </tr>
              </tfoot>
            </table>
            <p className="mt-3 text-[12px] text-steel-400">
              Attendance % = number of PRESENT days ÷ working days. Weekends are off (not counted). Figures are computed
              by the backend from stored attendance records.
            </p>
          </div>
        </Card>
      )}
    </div>
  );
}
