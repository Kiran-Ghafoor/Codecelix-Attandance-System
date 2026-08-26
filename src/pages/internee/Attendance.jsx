import { CheckCircle2, Percent, XCircle, Clock } from "lucide-react";
import { Card, CardHeader, StatCard } from "../../components/ui/Card";
import { Table, THead, TRow, TCell } from "../../components/ui/Table";
import Badge from "../../components/ui/Badge";
import EmptyState from "../../components/ui/EmptyState";
import { ATTENDANCE_SUMMARY, ATTENDANCE_HISTORY } from "../../lib/mockData";
import { formatDate, formatTime } from "../../lib/format";

export default function Attendance() {
  const hasHistory = ATTENDANCE_HISTORY.length > 0;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Attendance" value={`${ATTENDANCE_SUMMARY.percentage}%`} icon={Percent} tone="brand" />
        <StatCard label="Present" value={ATTENDANCE_SUMMARY.present} icon={CheckCircle2} tone="green" />
        <StatCard label="Late" value={ATTENDANCE_SUMMARY.late} icon={Clock} tone="amber" />
        <StatCard label="Absent" value={ATTENDANCE_SUMMARY.absent} icon={XCircle} tone="red" />
      </div>

      <Card padded={false}>
        <div className="p-5 pb-0">
          <CardHeader title="Attendance history" subtitle="Automatically determined from your submission timing" />
        </div>
        {hasHistory ? (
          <div className="p-5 pt-0">
            <Table>
              <THead columns={["Date", "Status", "Submitted at", "Deadline"]} />
              <tbody>
                {ATTENDANCE_HISTORY.map((day) => (
                  <TRow key={day.date}>
                    <TCell className="font-medium text-steel-800">{formatDate(day.date)}</TCell>
                    <TCell>
                      <Badge status={day.status} />
                    </TCell>
                    <TCell>{day.submittedAt ? formatTime(day.submittedAt) : "—"}</TCell>
                    <TCell>{formatTime(day.deadline)}</TCell>
                  </TRow>
                ))}
              </tbody>
            </Table>
          </div>
        ) : (
          <div className="p-5">
            <EmptyState title="No attendance recorded yet" description="Your attendance history will appear here once tasks are submitted." />
          </div>
        )}
      </Card>
    </div>
  );
}
