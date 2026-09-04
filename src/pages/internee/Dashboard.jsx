import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { CalendarClock, CheckCircle2, Percent, UploadCloud, XCircle } from "lucide-react";
import { Card, CardHeader, StatCard } from "../../components/ui/Card";
import Badge from "../../components/ui/Badge";
import Button from "../../components/ui/Button";
import Skeleton from "../../components/ui/Skeleton";
import { apiRequest } from "../../lib/api";
import { formatDate, formatTime } from "../../lib/format";
import { isWeekend, getDayName, todayISODate } from "../../lib/dateUtils";

const TASK_BADGE = { submitted: "present", pending: "pending" };

export default function InterneeDashboard() {
  const navigate = useNavigate();
  const [data, setData] = useState(null);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        const res = await apiRequest("/me/dashboard");
        if (!cancelled) setData(res);
      } catch {
        if (!cancelled) setData(null);
      }
    }
    load();
    return () => { cancelled = true; };
  }, []);

  if (!data) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-[84px] w-full rounded-xl" />
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-[100px] w-full rounded-xl" />
          ))}
        </div>
        <Skeleton className="h-[200px] w-full rounded-xl" />
      </div>
    );
  }

  const { user, batch, domain, attendanceSummary, currentTask } = data;
  const stat = attendanceSummary ?? { percentage: 0, present: 0, absent: 0, totalDays: 0 };
  const today = todayISODate();
  const isClosedForWeekend = isWeekend(today);

  return (
    <div className="space-y-6">
      {/* Welcome + batch */}
      <div className="flex flex-col justify-between gap-4 rounded-xl border border-steel-200 bg-white p-5 shadow-card sm:flex-row sm:items-center">
        <div>
          <p className="font-display text-lg font-semibold text-steel-900">Welcome back, {user?.name?.split(" ")[0]}</p>
          <p className="mt-1 text-sm text-steel-500">
            {batch?.batchCode ?? "Unassigned batch"}
            {domain ? ` · ${domain.name}` : ""}
          </p>
        </div>
        <Button icon={UploadCloud} onClick={() => navigate("/internee/submit-task")}>
          Submit Task
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <StatCard label="Attendance" value={`${stat.percentage}%`} icon={Percent} tone="brand" hint={`${stat.totalDays} tracked days`} />
        <StatCard label="Present" value={stat.present} icon={CheckCircle2} tone="green" />
        <StatCard label="Absent" value={stat.absent} icon={XCircle} tone="red" />
      </div>

      <div className="grid grid-cols-1 gap-6">
        {/* Today's task */}
        <Card>
          <CardHeader
            title="Today's task"
            subtitle="Submit your task daily before the deadline to be marked present."
          />
          {isClosedForWeekend ? (
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-steel-100">
                  <CalendarClock className="h-6 w-6 text-steel-400" />
                </div>
                <div>
                  <p className="text-[15px] font-semibold text-steel-900">Submissions closed</p>
                  <p className="mt-0.5 text-sm text-steel-500">
                    Today is{" "}
                    <span className="font-medium text-steel-700">{getDayName(today)}</span> — task submission is closed
                    on weekends (Saturday &amp; Sunday). Attendance for today is marked as off.
                  </p>
                </div>
              </div>
              <Badge status="off" />
            </div>
          ) : currentTask?.status === "submitted" ? (
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-green-50">
                  <CheckCircle2 className="h-6 w-6 text-green-600" />
                </div>
                <div>
                  <p className="text-[15px] font-semibold text-steel-900">Task submitted for today</p>
                  <p className="mt-0.5 text-sm text-steel-500">
                    Submitted on {currentTask?.deadline ? formatDate(currentTask.deadline) : "today"}
                    {currentTask?.submittedAt ? ` at ${formatTime(currentTask.submittedAt)}` : ""}.
                  </p>
                </div>
              </div>
              <Badge status="present" />
            </div>
          ) : (
            <>
              <p className="text-[15px] font-medium text-steel-900">Submit today's task</p>
              {currentTask?.deadline && (
                <div className="mt-2 flex items-center gap-2 text-sm text-steel-500">
                  <CalendarClock className="h-4 w-4" />
                  Deadline: {formatDate(currentTask.deadline)} at {formatTime(currentTask.deadline)}
                </div>
              )}
              <div className="mt-4 flex items-center gap-3">
                <Badge status={TASK_BADGE[currentTask?.status] ?? "pending"} />
                <Button icon={UploadCloud} onClick={() => navigate("/internee/submit-task")}>
                  Submit now
                </Button>
              </div>
            </>
          )}
        </Card>
      </div>
    </div>
  );
}
