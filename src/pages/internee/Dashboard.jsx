import { useNavigate } from "react-router-dom";
import { CalendarClock, CheckCircle2, Percent, UploadCloud, XCircle, Clock } from "lucide-react";
import { Card, CardHeader, StatCard } from "../../components/ui/Card";
import Badge from "../../components/ui/Badge";
import Button from "../../components/ui/Button";
import { useAuth } from "../../context/AuthContext";
import { ATTENDANCE_SUMMARY, CURRENT_TASK, ATTENDANCE_HISTORY } from "../../lib/mockData";
import { formatDate, formatTime } from "../../lib/format";

export default function InterneeDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const recent = ATTENDANCE_HISTORY.slice(0, 5);

  return (
    <div className="space-y-6">
      {/* Welcome + batch */}
      <div className="flex flex-col justify-between gap-4 rounded-xl border border-steel-200 bg-white p-5 shadow-card sm:flex-row sm:items-center">
        <div>
          <p className="font-display text-lg font-semibold text-steel-900">Welcome back, {user?.name?.split(" ")[0]}</p>
          <p className="mt-1 text-sm text-steel-500">{user?.batch}</p>
        </div>
        <Button icon={UploadCloud} onClick={() => navigate("/internee/submit-task")}>
          Submit Task
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Attendance" value={`${ATTENDANCE_SUMMARY.percentage}%`} icon={Percent} tone="brand" hint={`${ATTENDANCE_SUMMARY.totalDays} tracked days`} />
        <StatCard label="Present" value={ATTENDANCE_SUMMARY.present} icon={CheckCircle2} tone="green" />
        <StatCard label="Late" value={ATTENDANCE_SUMMARY.late} icon={Clock} tone="amber" />
        <StatCard label="Absent" value={ATTENDANCE_SUMMARY.absent} icon={XCircle} tone="red" />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Current task */}
        <Card className="lg:col-span-2">
          <CardHeader
            title="Current task submission"
            subtitle="Assigned via WhatsApp — submit before the deadline to be marked present."
          />
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-[15px] font-medium text-steel-900">{CURRENT_TASK.title}</p>
              <div className="mt-2 flex items-center gap-2 text-sm text-steel-500">
                <CalendarClock className="h-4 w-4" />
                Deadline: {formatDate(CURRENT_TASK.deadline)} at {formatTime(CURRENT_TASK.deadline)}
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Badge status={CURRENT_TASK.status} />
              <Button icon={UploadCloud} onClick={() => navigate("/internee/submit-task")}>
                Submit now
              </Button>
            </div>
          </div>
        </Card>

        {/* Recent attendance */}
        <Card>
          <CardHeader title="Recent attendance" subtitle="Last 5 days" />
          <ul className="space-y-3">
            {recent.map((day) => (
              <li key={day.date} className="flex items-center justify-between text-sm">
                <span className="text-steel-600">{formatDate(day.date)}</span>
                <Badge status={day.status} />
              </li>
            ))}
          </ul>
          <button
            onClick={() => navigate("/internee/attendance")}
            className="mt-4 text-sm font-medium text-brand-600 hover:text-brand-700"
          >
            View full history →
          </button>
        </Card>
      </div>
    </div>
  );
}
