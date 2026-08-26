import { useNavigate } from "react-router-dom";
import { ClipboardList, Clock, FileText, Layers, Users, XCircle, CheckCircle2 } from "lucide-react";
import { Card, CardHeader, StatCard } from "../../components/ui/Card";
import { Table, THead, TRow, TCell } from "../../components/ui/Table";
import Badge from "../../components/ui/Badge";
import Button from "../../components/ui/Button";
import EmptyState from "../../components/ui/EmptyState";
import { ADMIN_STATS, DAILY_ATTENDANCE_ROWS } from "../../lib/mockData";
import { formatTime } from "../../lib/format";

export default function AdminDashboard() {
  const navigate = useNavigate();

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-3 xl:grid-cols-6">
        <StatCard label="Total internees" value={ADMIN_STATS.totalInternees} icon={Users} tone="brand" />
        <StatCard label="Active batches" value={ADMIN_STATS.activeBatches} icon={Layers} tone="steel" />
        <StatCard label="Present today" value={ADMIN_STATS.presentToday} icon={CheckCircle2} tone="green" />
        <StatCard label="Late today" value={ADMIN_STATS.lateToday} icon={Clock} tone="amber" />
        <StatCard label="Absent today" value={ADMIN_STATS.absentToday} icon={XCircle} tone="red" />
        <StatCard label="Pending" value={ADMIN_STATS.pendingSubmissions} icon={ClipboardList} tone="brand" />
      </div>

      <Card padded={false}>
        <div className="px-5 pt-5 pb-0 sm:px-6">
          <CardHeader title="Today's attendance" subtitle="Live submission status across all batches" />
        </div>
        <div className="p-5 pt-0 sm:p-6 sm:pt-0">
          {DAILY_ATTENDANCE_ROWS.length > 0 ? (
            <Table>
              <THead columns={["Internee", "Submission", "Time", "Status", "View"]} />
              <tbody>
                {DAILY_ATTENDANCE_ROWS.map((row) => (
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
