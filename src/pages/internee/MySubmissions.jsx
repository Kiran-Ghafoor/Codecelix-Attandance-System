import { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { ExternalLink, Eye, FileText, GitBranch } from "lucide-react";
import { Card, CardHeader } from "../../components/ui/Card";
import { Table, THead, TRow, TCell } from "../../components/ui/Table";
import Badge from "../../components/ui/Badge";
import Button from "../../components/ui/Button";
import EmptyState from "../../components/ui/EmptyState";
import { useAuth } from "../../context/AuthContext";
import { getInterneeSubmissions } from "../../lib/mockData";
import { formatDate, formatTime } from "../../lib/format";

// Ownership is enforced server-side by the backend using the JWT.
// The mock layer filters by user.id as a stand-in until the real API.
export default function MySubmissions() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const submissions = useMemo(() => (user ? getInterneeSubmissions(user.id) : []), [user]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <p className="text-sm text-steel-500">{submissions.length} submissions on record</p>
      </div>

      <Card padded={false}>
        <div className="p-5 pb-0">
          <CardHeader title="My submissions" subtitle="Every task submission you have recorded" />
        </div>
        <div className="p-5 pt-0">
          {submissions.length > 0 ? (
            <Table>
              <THead columns={["Task / reference", "Date", "Time", "Deadline", "Status", "PDF", "GitHub", "View"]} />
              <tbody>
                {submissions.map((s) => (
                  <TRow key={s.id} className="cursor-pointer" onClick={() => navigate(`/internee/submissions/${s.id}`)}>
                    <TCell className="max-w-[240px] truncate font-medium text-steel-800" >
                      <span title={s.taskRef}>{s.taskRef}</span>
                    </TCell>
                    <TCell>{formatDate(s.date)}</TCell>
                    <TCell>{formatTime(s.submittedAt)}</TCell>
                    <TCell>
                      {formatDate(s.deadline)} · {formatTime(s.deadline)}
                    </TCell>
                    <TCell>
                      {/* Server-decided attendance; rendered as-is */}
                      <Badge status={s.status === "on-time" ? "present" : s.status} />
                    </TCell>
                    <TCell>
                      {s.fileName ? (
                        <span className="inline-flex max-w-[150px] items-center gap-1.5" title={s.fileName}>
                          <FileText className="h-3.5 w-3.5 shrink-0 text-steel-400" />
                          <span className="truncate">{s.fileName}</span>
                        </span>
                      ) : (
                        <span className="text-steel-400">—</span>
                      )}
                    </TCell>
                    <TCell>
                      {s.githubUrl ? (
                        <a
                          href={s.githubUrl}
                          target="_blank"
                          rel="noreferrer"
                          onClick={(e) => e.stopPropagation()}
                          className="inline-flex items-center gap-1.5 text-brand-600 hover:underline"
                        >
                          <GitBranch className="h-3.5 w-3.5" /> Repo <ExternalLink className="h-3 w-3" />
                        </a>
                      ) : (
                        <span className="text-steel-400">—</span>
                      )}
                    </TCell>
                    <TCell>
                      <Button
                        variant="secondary"
                        size="sm"
                        icon={Eye}
                        onClick={(e) => {
                          e.stopPropagation();
                          navigate(`/internee/submissions/${s.id}`);
                        }}
                      >
                        View Submission
                      </Button>
                    </TCell>
                  </TRow>
                ))}
              </tbody>
            </Table>
          ) : (
            <EmptyState
              title="No submissions yet"
              description="Tasks you submit will be listed here with their attendance status."
            />
          )}
        </div>
      </Card>
    </div>
  );
}
