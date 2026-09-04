import { useEffect, useState } from "react";
import { Card, CardHeader } from "../../components/ui/Card";
import EmptyState from "../../components/ui/EmptyState";
import Skeleton from "../../components/ui/Skeleton";
import { History } from "lucide-react";
import { apiRequest } from "../../lib/api";
import { formatDate, formatTime } from "../../lib/format";

export default function ActivityLog() {
  const [logs, setLogs] = useState(null);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        const data = await apiRequest("/activity-log?limit=100");
        if (!cancelled) setLogs(Array.isArray(data.logs) ? data.logs : []);
      } catch {
        if (!cancelled) setLogs([]);
      }
    }
    load();
    return () => { cancelled = true; };
  }, []);

  return (
    <Card padded={false}>
      <div className="px-5 pt-5 pb-0 sm:px-6">
        <CardHeader title="Activity log" subtitle="System and admin actions, most recent first" />
      </div>
      <div className="p-5 pt-0 sm:p-6 sm:pt-0">
        {logs === null ? (
          <div className="space-y-2">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="flex items-start justify-between gap-4 py-2">
                <div className="space-y-1.5">
                  <Skeleton className="h-4 w-72" />
                  <Skeleton className="h-3 w-40" />
                </div>
                <Skeleton className="h-3 w-28 shrink-0" />
              </div>
            ))}
          </div>
        ) : logs.length > 0 ? (
          <ul className="divide-y divide-steel-100/80">
            {logs.map((log) => (
              <li key={log.id} className="flex flex-col gap-1 py-3 sm:flex-row sm:items-start sm:justify-between sm:gap-4">
                <div className="min-w-0">
                  <p className="text-[13px] text-steel-800">{log.action}</p>
                  <p className="mt-0.5 text-[12px] text-steel-400">{log.actor}</p>
                </div>
                <span className="shrink-0 text-[12px] text-steel-400">
                  {formatDate(log.timestamp)} · {formatTime(log.timestamp)}
                </span>
              </li>
            ))}
          </ul>
        ) : (
          <EmptyState icon={History} title="No activity yet" description="Admin and system actions will be logged here." />
        )}
      </div>
    </Card>
  );
}
