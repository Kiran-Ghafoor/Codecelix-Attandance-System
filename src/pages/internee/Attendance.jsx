import { useEffect, useState } from "react";
import { CheckCircle2, Percent, XCircle } from "lucide-react";
import { Card, CardHeader, StatCard } from "../../components/ui/Card";
import { Table, THead, TRow, TCell } from "../../components/ui/Table";
import Badge from "../../components/ui/Badge";
import EmptyState from "../../components/ui/EmptyState";
import Skeleton from "../../components/ui/Skeleton";
import { apiRequest } from "../../lib/api";
import { formatDate, formatTime } from "../../lib/format";

export default function Attendance() {
  const [data, setData] = useState(null);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        const res = await apiRequest("/me/attendance");
        if (!cancelled) setData(res);
      } catch {
        if (!cancelled) setData({ history: [], summary: null });
      }
    }
    load();
    return () => { cancelled = true; };
  }, []);

  if (!data) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-[100px] w-full rounded-xl" />
          ))}
        </div>
        <Skeleton className="h-[300px] w-full rounded-xl" />
      </div>
    );
  }

  const stat = data.summary ?? { percentage: 0, present: 0, absent: 0, totalDays: 0 };
  const history = data.history ?? [];
  const threeMonth = data.threeMonth;
  const hasHistory = history.length > 0;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <StatCard label="Attendance" value={`${stat.percentage}%`} icon={Percent} tone="brand" />
        <StatCard label="Present" value={stat.present} icon={CheckCircle2} tone="green" />
        <StatCard label="Absent" value={stat.absent} icon={XCircle} tone="red" />
      </div>

      {threeMonth && (
        <Card>
          <div className="p-5 pb-2">
            <CardHeader
              title="3-Month attendance"
              subtitle="Overall attendance for the last 3 months, with a monthly breakdown"
            />
          </div>
          <div className="p-5 pt-2">
            <div className="flex items-center justify-between rounded-lg border border-steel-200 bg-steel-50 px-4 py-3">
              <span className="text-sm font-semibold text-steel-800">Overall (last 3 months)</span>
              <span className="text-sm font-bold text-brand-600">
                {threeMonth.overallPercent == null ? "—" : `${threeMonth.overallPercent}%`}
              </span>
            </div>
            <div className="mt-3 space-y-2">
              {threeMonth.monthly.map((m) => (
                <div key={m.monthKey} className="flex items-center justify-between rounded-lg border border-steel-200 px-4 py-2.5">
                  <span className="text-sm text-steel-700">{m.monthLabel}</span>
                  <span className="text-sm font-semibold text-steel-900">
                    {m.percent == null ? "—" : `${m.percent}%`}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </Card>
      )}

      <Card padded={false}>
        <div className="p-5 pb-0">
          <CardHeader title="Attendance history" subtitle="Automatically determined from your submission timing" />
        </div>
        {hasHistory ? (
          <div className="p-5 pt-0">
            <Table>
              <THead columns={["Date", "Status", "Submitted at"]} />
              <tbody>
                {history.map((day) => (
                  <TRow key={day.id}>
                    <TCell className="font-medium text-steel-800">{formatDate(day.date)}</TCell>
                    <TCell>
                      <Badge status={day.status} />
                    </TCell>
                    <TCell>{day.submittedAt ? formatTime(day.submittedAt) : "—"}</TCell>
                  </TRow>
                ))}
              </tbody>
            </Table>
          </div>
        ) : (
          <div className="p-5">
            <EmptyState
              title="No attendance recorded yet"
              description="Your attendance history will appear here once tasks are submitted."
            />
          </div>
        )}
      </Card>
    </div>
  );
}
