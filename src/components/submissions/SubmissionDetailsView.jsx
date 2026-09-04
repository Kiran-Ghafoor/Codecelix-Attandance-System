import { useNavigate } from "react-router-dom";
import { ArrowLeft, Download, ExternalLink, Eye, FileText, GitBranch } from "lucide-react";
import { Card, CardHeader } from "../ui/Card";
import Avatar from "../ui/Avatar";
import Badge from "../ui/Badge";
import Button from "../ui/Button";
import DetailRow from "../ui/DetailRow";
import EmptyState from "../ui/EmptyState";
import { useBatches } from "../../context/BatchesContext";
import { API_BASE_URL } from "../../lib/api";
import { buildDomainIndex, getDomainLeader } from "../../lib/relations";
import { formatDate, formatTime } from "../../lib/format";

// Presentation-only labels for stored file types (UI never infers storage).
const FILE_TYPE_LABELS = {
  "application/pdf": "PDF",
  "application/msword": "Word",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document": "Word",
  "application/vnd.ms-excel": "Excel",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet": "Excel",
  "application/vnd.ms-powerpoint": "PowerPoint",
  "application/vnd.openxmlformats-officedocument.presentationml.presentation": "PowerPoint",
  "text/plain": "Text",
  "text/csv": "CSV",
  "image/png": "Image",
  "image/jpeg": "Image",
  "image/gif": "Image",
  "image/webp": "Image",
  "image/bmp": "Image",
};

function fileTypeLabel(mimeType, fileName) {
  if (FILE_TYPE_LABELS[mimeType]) return FILE_TYPE_LABELS[mimeType];
  const ext = fileName ? (fileName.split(".").pop() || "").toUpperCase() : "";
  return ext ? ext : "File";
}

// Shared detail view used by both roles:
//   /internee/submissions/:submissionId  and  /admin/submissions/:submissionId
export default function SubmissionDetailsView({ submission, backTo, backLabel, roster = [] }) {
  const { batches } = useBatches();

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
  const interneeName = submission.internee ?? (submission.interneeId ? null : null);
  const leader = getDomainLeader(entry?.domain.teamLeaderId, roster);

  const isFile = (submission.type === "pdf" || submission.type === "file") && submission.fileName;
  const document = isFile
    ? {
        fileName: submission.fileName,
        fileType: submission.mimeType || "application/octet-stream",
        fileSize: submission.fileSizeBytes ?? 0,
        storageFileId: submission.storageFileId,
        viewUrl: `${API_BASE_URL}/submissions/${submission.id}/file?mode=view`,
        downloadUrl: `${API_BASE_URL}/submissions/${submission.id}/file?mode=download`,
      }
    : null;

  return (
    <div className="space-y-5">
      <BackLink to={backTo} label={backLabel} />

      <div>
        <div className="flex flex-wrap items-center gap-3">
          <h1 className="font-display text-xl font-bold text-steel-900">{submission.taskRef}</h1>
          <Badge status={submission.status === "on-time" ? "present" : submission.status} />
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
                {interneeName ? (
                  <span className="inline-flex items-center justify-end gap-2">
                    <Avatar person={{ name: interneeName }} size="h-6 w-6 text-[10px]" />
                    {interneeName}
                  </span>
                ) : (
                  "—"
                )}
              </DetailRow>
              <DetailRow label="Batch">{submission.batch ?? entry?.batch.batchCode ?? "—"}</DetailRow>
              <DetailRow label="Domain">{entry?.domain.name ?? "—"}</DetailRow>
              <DetailRow label="Team Leader">{leader ? leader.name : <span className="text-steel-400">Unassigned</span>}</DetailRow>
              <DetailRow label="Submission date">{formatDate(submission.date)}</DetailRow>
              <DetailRow label="Submission time">{formatTime(submission.submittedAt)}</DetailRow>
              <DetailRow label="Deadline">
                {formatDate(submission.deadline)} at {formatTime(submission.deadline)}
              </DetailRow>
              <DetailRow label="Attendance status">
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
                      {fileTypeLabel(document.fileType, document.fileName)} · {humanFileSize(document.fileSize)}
                    </p>
                    {document.storageFileId && (
                      <p className="mt-0.5 truncate font-mono text-[11px] text-steel-400" title={document.storageFileId}>
                        ID {document.storageFileId}
                      </p>
                    )}
                  </div>
                </div>
                <div className="mt-3 grid grid-cols-2 gap-2">
                  <a
                    href={document.viewUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center justify-center gap-1.5 rounded-lg border border-steel-200 bg-white px-3 py-2 text-[12px] font-medium text-steel-700 transition-colors hover:bg-steel-50"
                  >
                    <Eye className="h-3.5 w-3.5" /> View file
                  </a>
                  <a
                    href={document.downloadUrl}
                    className="inline-flex items-center justify-center gap-1.5 rounded-lg border border-steel-200 bg-white px-3 py-2 text-[12px] font-medium text-steel-700 transition-colors hover:bg-steel-50"
                  >
                    <Download className="h-3.5 w-3.5" /> Download
                  </a>
                </div>
              </div>
            ) : (
              <p className="rounded-lg border border-dashed border-steel-200 bg-steel-50/50 px-3.5 py-3 text-[13px] text-steel-400">
                No file submitted
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
    </div>
  );
}

function humanFileSize(bytes) {
  if (bytes == null) return "—";
  if (bytes < 1024 * 1024) return `${Math.max(1, Math.round(bytes / 1024))} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function BackLink({ to, label }) {
  const navigate = useNavigate();
  // Use browser history when it exists (back arrow on every page); otherwise
  // fall back to the explicit route the view was opened from.
  const handleBack = () => {
    if (window.history.length > 1) navigate(-1);
    else navigate(to);
  };
  return (
    <button
      type="button"
      onClick={handleBack}
      className="inline-flex cursor-pointer items-center gap-1.5 text-[13px] font-medium text-steel-500 transition-colors hover:text-brand-700"
    >
      <ArrowLeft className="h-3.5 w-3.5" /> {label}
    </button>
  );
}

function repoFromUrl(url) {
  try {
    return new URL(url).pathname.split("/").filter(Boolean).slice(0, 2).join("/") || url;
  } catch {
    return url;
  }
}
