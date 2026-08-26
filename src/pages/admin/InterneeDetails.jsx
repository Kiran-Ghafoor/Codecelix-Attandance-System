import { useMemo } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, ExternalLink, FileText, GitBranch } from "lucide-react";
import { Card, CardHeader } from "../../components/ui/Card";
import { Table, THead, TRow, TCell } from "../../components/ui/Table";
import Avatar from "../../components/ui/Avatar";
import Badge from "../../components/ui/Badge";
import Button from "../../components/ui/Button";
import DetailRow from "../../components/ui/DetailRow";
import EmptyState from "../../components/ui/EmptyState";
import { useBatches } from "../../context/BatchesContext";
import { useInternees } from "../../context/InterneesContext";
import {
  getAttendanceSummary,
  getInterneeById,
  getInterneeSubmissions,
  getDomainLeader,
  buildDomainIndex,
} from "../../lib/mockData";
import { formatDate, formatTime } from "../../lib/format";

const SUMMARY_TONES = {
  present: "text-emerald-600",
  late: "text-amber-600",
  absent: "text-red-600",
};

export default function InterneeDetails() {
  const { interneeId } = useParams();
  const navigate = useNavigate();
  const { batches } = useBatches();
  const { internees: roster } = useInternees();

  // Resolved against the live roster so manually added internees open too.
  const internee = getInterneeById(interneeId, roster);
  const domainIndex = useMemo(() => buildDomainIndex(batches), [batches]);
  const entry = internee ? domainIndex.get(internee.domainId) : null;

  if (!internee) {
    return (
      <div className="space-y-5">
        <div>
          <Link
            to="/admin/internees"
            className="inline-flex items-center gap-1.5 text-[13px] font-medium text-steel-500 transition-colors hover:text-brand-700"
          >
            <ArrowLeft className="h-3.5 w-3.5" /> Back to internees
          </Link>
        </div>
        <EmptyState
          title="Internee not found"
          description="This internee doesn't exist or may have been removed."
          action={
            <Button variant="secondary" icon={ArrowLeft} onClick={() => navigate("/admin/internees")}>
              Back to internees
            </Button>
          }
        />
      </div>
    );
  }

  const batch = entry?.batch;
  const domain = entry?.domain;
  const leader = getDomainLeader(domain?.teamLeaderId, roster);
  const summary = getAttendanceSummary(internee);
  const submissions = getInterneeSubmissions(internee.id);

  return (
    <div className="space-y-5">
      <div>
        <Link
          to="/admin/internees"
          className="inline-flex items-center gap-1.5 text-[13px] font-medium text-steel-500 transition-colors hover:text-brand-700"
        >
          <ArrowLeft className="h-3.5 w-3.5" /> Back to internees
        </Link>
      </div>

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-4">
          <Avatar person={internee} size="h-12 w-12 text-sm" />
          <div className="min-w-0">
            <h1 className="font-display text-xl font-bold text-steel-900">{internee.name}</h1>
            <p className="mt-0.5 truncate text-[13px] text-steel-500">{internee.email}</p>
          </div>
        </div>
        <Badge status={internee.status.toLowerCase()} />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <Card padded={false} className="lg:col-span-2">
          <div className="p-5 pb-0">
            <CardHeader title="Profile" />
          </div>
          <div className="p-5 pt-0">
            <div className="divide-y divide-steel-100 rounded-lg border border-steel-200">
              <DetailRow label="Batch">{batch ? batch.name : "—"}</DetailRow>
              <DetailRow label="Domain">{domain ? domain.name : "—"}</DetailRow>
              <DetailRow label="Team Leader">
                {leader ? (
                  <span className="inline-flex items-center justify-end gap-2">
                    <Avatar person={leader} size="h-6 w-6 text-[10px]" />
                    {leader.name}
                  </span>
                ) : (
                  <span className="text-steel-400">Unassigned</span>
                )}
              </DetailRow>
              <DetailRow label="Internship status">
                <Badge status={internee.status.toLowerCase()} dot={false} />
              </DetailRow>
              {internee.phone && <DetailRow label="Phone">{internee.phone}</DetailRow>}
              {internee.cnic && <DetailRow label="CNIC">{internee.cnic}</DetailRow>}
              {internee.joinDate && <DetailRow label="Join date">{formatDate(internee.joinDate)}</DetailRow>}
            </div>
          </div>
        </Card>

        <Card>
          <CardHeader title="Attendance summary" subtitle={`Based on the last ${summary.totalDays} working days`} />
          <div className="flex flex-wrap items-center gap-6">
            <div>
              <p className="font-display text-[36px] font-bold leading-none text-brand-700">{summary.percentage}%</p>
              <p className="mt-1.5 text-[13px] text-steel-500">Overall attendance</p>
            </div>
            <div className="grid flex-1 grid-cols-3 gap-3">
              {[
                ["Present", summary.present, "present"],
                ["Late", summary.late, "late"],
                ["Absent", summary.absent, "absent"],
              ].map(([label, value, key]) => (
                <div key={key} className="rounded-lg border border-steel-200 p-3">
                  <p className={`font-display text-xl font-semibold ${SUMMARY_TONES[key]}`}>{value}</p>
                   <p className="mt-0.5 text-[12px] text-steel-500">{label}</p>
                </div>
              ))}
            </div>
          </div>
        </Card>
      </div>

      <Card padded={false}>
        <div className="px-5 pt-5 pb-0 sm:px-6">
          <CardHeader title="Recent submissions" subtitle={`${submissions.length} on record`} />
        </div>
        <div className="p-5 pt-0 sm:p-6 sm:pt-0">
          {submissions.length > 0 ? (
            <Table>
              <THead columns={["Task / reference", "Date", "Time", "Status", "View"]} />
              <tbody>
                {submissions.map((s) => (
                  <TRow key={s.id}>
                    <TCell>
                      {s.type === "pdf" && (
                        <span className="inline-flex items-center gap-1.5">
                          <FileText className="h-3.5 w-3.5 shrink-0 text-steel-400" /> {s.fileName}
                        </span>
                      )}
                      {s.type === "github" && (
                        <span className="inline-flex items-center gap-1.5">
                          <GitBranch className="h-3.5 w-3.5 shrink-0 text-steel-400" /> Repo
                        </span>
                      )}
                      {!s.type && <span className="text-steel-400">—</span>}
                    </TCell>
                    <TCell>{formatDate(s.date)}</TCell>
                    <TCell>{formatTime(s.submittedAt)}</TCell>
                    <TCell>
                      <Badge status={s.status} />
                    </TCell>
                    <TCell>
                      <Button
                        variant="secondary"
                        size="sm"
                        icon={ExternalLink}
                        disabled={!s.githubUrl}
                        onClick={() => window.open(s.githubUrl, "_blank", "noopener,noreferrer")}
                      >
                        View
                      </Button>
                    </TCell>
                  </TRow>
                ))}
              </tbody>
            </Table>
          ) : (
            <EmptyState
              icon={FileText}
              title="No submissions yet"
              description="Task submissions from this internee will appear here."
            />
          )}
        </div>
      </Card>
    </div>
  );
}
