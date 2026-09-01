import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ClipboardList, FileText, Layers, Users, XCircle, CheckCircle2 } from "lucide-react";
import { Card, CardHeader, StatCard } from "../../components/ui/Card";
import { Table, THead, TRow, TCell } from "../../components/ui/Table";
import Badge from "../../components/ui/Badge";
import Button from "../../components/ui/Button";
import EmptyState from "../../components/ui/EmptyState";
import Skeleton from "../../components/ui/Skeleton";
import { apiRequest } from "../../lib/api";
import { todayISODate } from "../../lib/dateUtils";
import { formatTime } from "../../lib/format";

function SkeletonTable() {
  return (
    <Table>
      <THead columns={["Internee", "Submission", "Time", "Status", "View"]} />
      <tbody>
        {Array.from({ length: 5 }).map((_, i) => (
          <TRow key={i}>
            <TCell><Skeleton className="h-4 w-28" /></TCell>
            <TCell><Skeleton className="h-4 w-40" /></TCell>
            <TCell><Skeleton className="h-4 w-14" /></TCell>
            <TCell><Skeleton className="h-5 w-16 rounded-full" /></TCell>
            <TCell><Skeleton className="h-7 w-20 rounded-lg" /></TCell>
          </TRow>
        ))}
      </tbody>
    </Table>
  );
}

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      setLoading(true);
      try {
        const [s, att] = await Promise.all([
          apiRequest("/dashboard/admin"),
          apiRequest(`/attendance/daily?date=${todayISODate()}`).catch(() => ({ rows: [] })),
        ]);
        if (cancelled) return;
        setStats(s);
        setRows(Array.isArray(att.rows) ? att.rows : []);
      } catch {
        if (!cancelled) setStats(null);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => { cancelled = true; };
  }, []);

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-3 xl:grid-cols-6">
        <StatCard label="Total internees" value={stats?.totalInternees ?? "—"} icon={Users} tone="brand" />
        <StatCard label="Active batches" value={stats?.activeBatches ?? "—"} icon={Layers} tone="steel" />
        <StatCard label="Present today" value={stats?.presentToday ?? "—"} icon={CheckCircle2} tone="green" />
        <StatCard label="Absent today" value={stats?.absentToday ?? "—"} icon={XCircle} tone="red" />
        <StatCard label="Pending" value={stats?.pendingSubmissions ?? "—"} icon={ClipboardList} tone="brand" />
      </div>

      <Card padded={false}>
        <div className="px-5 pt-5 pb-0 sm:px-6">
          <CardHeader title="Today's attendance" subtitle="Live submission status across all batches" />
        </div>
        <div className="p-5 pt-0 sm:p-6 sm:pt-0">
          {loading ? (
            <SkeletonTable />
          ) : rows.length > 0 ? (
            <Table>
              <THead columns={["Internee", "Submission", "Time", "Status", "View"]} />
              <tbody>
                {rows.map((row) => (
                  <TRow key={row.interneeId} className="cursor-pointer" onClick={() => navigate(row.submissionId ? `/admin/submissions/${row.submissionId}` : `/admin/internees/${row.interneeId}`)}>
                    <TCell className="font-medium text-steel-800">{row.internee}</TCell>
                    <TCell>{row.submission}</TCell>
                    <TCell>{row.submittedAt ? formatTime(row.submittedAt) : "—"}</TCell>
                    <TCell>
                      <Badge status={row.status} />
                    </TCell>
                    <TCell>
                      <Button
                        variant="secondary"
                        size="sm"
                        icon={FileText}
                        onClick={(e) => {
                          e.stopPropagation();
                          navigate(row.submissionId ? `/admin/submissions/${row.submissionId}` : `/admin/internees/${row.interneeId}`);
                        }}
                      >
                        {row.submissionId ? "View" : "No submission"}
                      </Button>
                    </TCell>
                  </TRow>
                ))}
              </tbody>
            </Table>
          ) : (
            <EmptyState
              icon={ClipboardList}
              title="No attendance data yet"
              description="Today's attendance will appear here once internees start submitting tasks."
            />
          )}
        </div>
      </Card>
    </div>
  );
}
