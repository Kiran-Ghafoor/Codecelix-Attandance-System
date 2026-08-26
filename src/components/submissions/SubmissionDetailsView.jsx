import { useState } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, Download, ExternalLink, Eye, FileText, GitBranch } from "lucide-react";
import { Card, CardHeader } from "../ui/Card";
import Avatar from "../ui/Avatar";
import Badge from "../ui/Badge";
import Button from "../ui/Button";
import DetailRow from "../ui/DetailRow";
import EmptyState from "../ui/EmptyState";
import PdfPreviewModal from "./PdfPreviewModal";
import { useBatches } from "../../context/BatchesContext";
import { getInterneeById, getDomainLeader, buildDomainIndex } from "../../lib/mockData";
import { getStoredDocument, STORAGE_MOCK_DOWNLOAD_NOTICE } from "../../lib/storage";
import { formatDate, formatFileSize, formatTime } from "../../lib/format";

// Presentation-only labels for stored file types (UI never infers storage).
const FILE_TYPE_LABELS = {
  "application/pdf": "PDF",
};

// Shared detail view used by both roles:
//   /internee/submissions/:submissionId  and  /admin/submissions/:submissionId
export default function SubmissionDetailsView({ submission, backTo, backLabel }) {
  const { batches } = useBatches();
  const [previewOpen, setPreviewOpen] = useState(false);
  const [downloadNotice, setDownloadNotice] = useState(false);

  if (!submission) {
    return (
      <div className="space-y-5">
        <BackLink to={backTo} label={backLabel} />
        <EmptyState
          title="Submission not found"
          description="This submission doesn't exist or you don't have access to it."
        />
      </div>
    );
  }

  const domainIndex = buildDomainIndex(batches);
  const entry = domainIndex.get(submission.domainId);
  const internee = getInterneeById(submission.interneeId);
  const leader = getDomainLeader(entry?.domain.teamLeaderId);
  // Storage-aware metadata (ID + URLs) comes from the storage module only —
  // the future backend supplies the real values; this component stays dumb.
  const document = getStoredDocument(submission);

  return (
    <div className="space-y-5">
      <BackLink to={backTo} label={backLabel} />

      <div>
        <div className="flex flex-wrap items-center gap-3">
          <h1 className="font-display text-xl font-bold text-steel-900">{submission.taskRef}</h1>
          <Badge status={submission.status} />
        </div>
        {submission.submittedAt && (
          <p className="mt-1 text-[13px] text-steel-500">
            Submitted {formatDate(submission.date)} at {formatTime(submission.submittedAt)}
          </p>
        )}
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <Card padded={false} className="lg:col-span-2">
          <div className="p-5 pb-0">
            <CardHeader title="Details" />
          </div>
          <div className="p-5 pt-0">
            <div className="divide-y divide-steel-100 rounded-lg border border-steel-200">
              <DetailRow label="Internee">
                {internee ? (
                  <span className="inline-flex items-center justify-end gap-2">
                    <Avatar person={internee} size="h-6 w-6 text-[10px]" />
                    {internee.name}
                  </span>
                ) : (
                  "—"
                )}
              </DetailRow>
              <DetailRow label="Batch">{entry?.batch.name ?? submission.batch ?? "—"}</DetailRow>
              <DetailRow label="Domain">{entry?.domain.name ?? "—"}</DetailRow>
              <DetailRow label="Team Leader">{leader ? leader.name : <span className="text-steel-400">Unassigned</span>}</DetailRow>
              <DetailRow label="Submission date">{formatDate(submission.date)}</DetailRow>
              <DetailRow label="Submission time">{formatTime(submission.submittedAt)}</DetailRow>
              <DetailRow label="Deadline">
                {formatDate(submission.deadline)} at {formatTime(submission.deadline)}
              </DetailRow>
              <DetailRow label="Attendance status">
                {/* Server-decided value; the frontend never computes attendance */}
                <Badge status={submission.status === "on-time" ? "present" : submission.status} dot={false} />
              </DetailRow>
            </div>
          </div>
        </Card>

        <Card padded={false}>
          <div className="p-5 pb-0">
            <CardHeader title="Files" />
          </div>
          <div className="space-y-4 p-5 pt-0">
            {document ? (
              <div className="rounded-lg border border-steel-200 p-3.5">
                <div className="flex items-center gap-3">
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-red-50">
                    <FileText className="h-5 w-5 text-red-500" />
                  </span>
                  <div className="min-w-0">
                    <p className="truncate text-[13px] font-medium text-steel-800" title={document.fileName}>
                      {document.fileName}
                    </p>
                    <p className="text-[12px] text-steel-400">
                      {FILE_TYPE_LABELS[document.fileType] ?? document.fileType} · {formatFileSize(document.fileSize)}
                    </p>
                    <p className="mt-0.5 truncate font-mono text-[11px] text-steel-400" title={document.storageFileId}>
                      ID {document.storageFileId}
                    </p>
                  </div>
                </div>
                <div className="mt-3 grid grid-cols-2 gap-2">
                  {/* Local mock viewer; production swaps in document.viewUrl */}
                  <Button variant="secondary" size="sm" icon={Eye} onClick={() => setPreviewOpen(true)}>
                    View PDF
                  </Button>
                  <Button
                    variant="secondary"
                    size="sm"
                    icon={Download}
                    onClick={(e) => {
                      if (document.isMock) {
                        e.preventDefault();
                        setDownloadNotice(true);
                      }
                    }}
                  >
                    Download
                  </Button>
                </div>
                {downloadNotice && (
                  <p className="mt-2 rounded-lg bg-amber-50 px-2.5 py-1.5 text-[11px] leading-relaxed text-amber-700">
                    {STORAGE_MOCK_DOWNLOAD_NOTICE}
                  </p>
                )}
              </div>
            ) : (
              <p className="rounded-lg border border-dashed border-steel-200 bg-steel-50/50 px-3.5 py-3 text-[13px] text-steel-400">
                No PDF submitted
              </p>
            )}

            {submission.githubUrl ? (
              <div className="rounded-lg border border-steel-200 p-3.5">
                <div className="flex items-center gap-3">
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-brand-50">
                    <GitBranch className="h-5 w-5 text-brand-600" />
                  </span>
                  <p className="truncate text-[13px] font-medium text-steel-800">{repoFromUrl(submission.githubUrl)}</p>
                </div>
                <Button
                  variant="secondary"
                  size="sm"
                  icon={ExternalLink}
                  className="mt-3 w-full"
                  onClick={() => window.open(submission.githubUrl, "_blank", "noopener,noreferrer")}
                >
                  Open GitHub
                </Button>
              </div>
            ) : (
              <p className="rounded-lg border border-dashed border-steel-200 bg-steel-50/50 px-3.5 py-3 text-[13px] text-steel-400">
                No repository provided
              </p>
            )}

            {submission.note && (
              <div className="rounded-lg bg-steel-50 p-3.5">
                <p className="text-[12px] font-semibold uppercase tracking-wide text-steel-400">Note</p>
                <p className="mt-1 text-[13px] text-steel-700">{submission.note}</p>
              </div>
            )}
          </div>
        </Card>
      </div>

      <PdfPreviewModal open={previewOpen} onClose={() => setPreviewOpen(false)} fileName={document?.fileName ?? "submission.pdf"} />
    </div>
  );
}

function BackLink({ to, label }) {
  return (
    <Link
      to={to}
      className="inline-flex items-center gap-1.5 text-[13px] font-medium text-steel-500 transition-colors hover:text-brand-700"
    >
      <ArrowLeft className="h-3.5 w-3.5" /> {label}
    </Link>
  );
}

function repoFromUrl(url) {
  try {
    return new URL(url).pathname.split("/").filter(Boolean).slice(0, 2).join("/") || url;
  } catch {
    return url;
  }
}
