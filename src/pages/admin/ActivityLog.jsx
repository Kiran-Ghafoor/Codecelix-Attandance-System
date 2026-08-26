import { Card, CardHeader } from "../../components/ui/Card";
import EmptyState from "../../components/ui/EmptyState";
import { History } from "lucide-react";
import { ACTIVITY_LOG } from "../../lib/mockData";
import { formatDate, formatTime } from "../../lib/format";

export default function ActivityLog() {
  return (
    <Card padded={false}>
      <div className="px-5 pt-5 pb-0 sm:px-6">
        <CardHeader title="Activity log" subtitle="System and admin actions, most recent first" />
      </div>
      <div className="p-5 pt-0 sm:p-6 sm:pt-0">
        {ACTIVITY_LOG.length > 0 ? (
          <ul className="divide-y divide-steel-100/80">
            {ACTIVITY_LOG.map((log) => (
              <li key={log.id} className="flex items-start justify-between gap-4 py-3">
                <div>
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
