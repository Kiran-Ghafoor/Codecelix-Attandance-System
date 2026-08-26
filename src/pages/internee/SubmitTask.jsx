import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import {
  AlertCircle,
  CalendarClock,
  CheckCircle2,
  ClipboardList,
  FileText,
  FileUp,
  GitBranch,
  RefreshCw,
  Trash2,
  UploadCloud,
} from "lucide-react";
import { Card, CardHeader } from "../../components/ui/Card";
import Button from "../../components/ui/Button";
import Input from "../../components/ui/Input";
import Textarea from "../../components/ui/Textarea";
import Badge from "../../components/ui/Badge";
import Modal from "../../components/ui/Modal";
import DetailRow from "../../components/ui/DetailRow";
import { CURRENT_TASK, MOCK_CURRENT_DATE, MOCK_SUBMISSION_RESPONSE } from "../../lib/mockData";
import { getStoredDocument, STORAGE_PROVIDER_LABEL } from "../../lib/storage";
import { formatDate, formatFileSize, formatTime } from "../../lib/format";
import { isWeekend, getDayName } from "../../lib/dateUtils";

const TABS = [
  { id: "pdf", label: "Upload PDF", icon: FileText },
  { id: "github", label: "GitHub repository", icon: GitBranch },
];

const MAX_PDF_BYTES = 20 * 1024 * 1024;
const GITHUB_URL_PATTERN = /^https:\/\/(www\.)?github\.com\/[\w.-]+\/[\w.-]+([/?#][^\s]*)?$/i;

// Attendance is decided by the backend (server submission timestamp vs the
// configured deadline). This mock response stands in for the future API
// result — the UI only renders whatever status it carries.
const MOCK_API_RESPONSE = { ...MOCK_SUBMISSION_RESPONSE };

function validatePdf(file) {
  const isPdf = file.type === "application/pdf" || file.name.toLowerCase().endsWith(".pdf");
  if (!isPdf) return "Only PDF files are allowed.";
  if (file.size > MAX_PDF_BYTES) return "File is too large — the limit is 20 MB.";
  return null;
}

function isValidGithubUrl(url) {
  return GITHUB_URL_PATTERN.test(url.trim());
}

function repoFromUrl(url) {
  try {
    return new URL(url.trim()).pathname.split("/").filter(Boolean).slice(0, 2).join("/") || url;
  } catch {
    return url;
  }
}

export default function SubmitTask() {
  const [tab, setTab] = useState("pdf");
  const [file, setFile] = useState(null);
  const [dragOver, setDragOver] = useState(false);
  const [fileError, setFileError] = useState("");
  const [githubUrl, setGithubUrl] = useState("");
  const [urlError, setUrlError] = useState("");
  const [note, setNote] = useState("");
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [done, setDone] = useState(false);
  const [storedDoc, setStoredDoc] = useState(null);
  const inputRef = useRef(null);

  // Simulated upload progress for the mock flow; a real implementation would
  // track the actual request instead.
  useEffect(() => {
    if (!uploading) return undefined;
    const timer = setInterval(() => {
      setProgress((p) => Math.min(100, p + Math.round(Math.random() * 16) + 8));
    }, 150);
    return () => clearInterval(timer);
  }, [uploading]);

  useEffect(() => {
    if (uploading && progress >= 100) {
      const finish = setTimeout(() => {
        // Mock stand-in for the future response: the backend uploads to
        // Google Drive, persists the file ID + metadata, and hands back the
        // document descriptor rendered below (see lib/storage.js).
        setStoredDoc(
          tab === "pdf" && file
            ? getStoredDocument({
                id: `local-${Date.now()}`,
                fileName: file.name,
                fileSizeBytes: file.size,
                date: new Date().toISOString().slice(0, 10),
                submittedAt: new Date().toISOString().slice(11, 16),
              })
            : null
        );
        setUploading(false);
        setConfirmOpen(false);
        setDone(true);
      }, 350);
      return () => clearTimeout(finish);
    }
    return undefined;
  }, [uploading, progress, tab, file]);

  function handleFilePick(nextFile) {
    if (!nextFile) return;
    const error = validatePdf(nextFile);
    if (error) {
      setFileError(error);
      return;
    }
    setFileError("");
    setFile(nextFile);
  }

  function resetAll() {
    setTab("pdf");
    setFile(null);
    setDragOver(false);
    setFileError("");
    setGithubUrl("");
    setUrlError("");
    setNote("");
    setConfirmOpen(false);
    setUploading(false);
    setProgress(0);
    setStoredDoc(null);
    setDone(false);
    if (inputRef.current) inputRef.current.value = "";
  }

  const canContinue =
    tab === "pdf" ? Boolean(file) && !fileError : isValidGithubUrl(githubUrl);

  // --- Weekend block -----------------------------------------------------------
  if (isWeekend(MOCK_CURRENT_DATE)) {
    return (
      <div className="mx-auto max-w-lg space-y-6">
        <Card className="text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-steel-100">
            <CalendarClock className="h-7 w-7 text-steel-400" />
          </div>
          <h2 className="font-display text-lg font-semibold text-steel-900">Submissions Closed</h2>
          <p className="mt-2 text-sm text-steel-500">
            Today is <span className="font-medium text-steel-700">{getDayName(MOCK_CURRENT_DATE)}</span> — submissions are
            closed on weekends (Saturday &amp; Sunday).
          </p>
          <p className="mt-1 text-xs text-steel-400">
            Your attendance for today has been marked as <Badge status="off" />. Submit your task on the next working day.
          </p>
          <div className="mt-6">
            <Link to="/internee/dashboard">
              <Button variant="secondary">Back to dashboard</Button>
            </Link>
          </div>
        </Card>
      </div>
    );
  }

  // --- Success state ---------------------------------------------------------
  if (done) {
    return (
      <Card className="mx-auto max-w-lg text-center">
        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-emerald-50">
          <CheckCircle2 className="h-7 w-7 text-emerald-600" />
        </div>
        <h2 className="font-display text-lg font-semibold text-steel-900">Submitted Successfully</h2>
        <div className="mt-4 space-y-1.5">
          {/* Submitted time + attendance come from the (mock) API response.
              The backend owns the real values. */}
          <p className="text-sm text-steel-600">
            Submitted: <span className="font-medium text-steel-800">{formatTime(new Date().toISOString())}</span>
          </p>
          <p className="flex items-center justify-center gap-2 text-sm text-steel-600">
            Attendance: <Badge status={MOCK_API_RESPONSE.attendanceStatus} />
          </p>
          {storedDoc && (
            <>
              <p className="flex items-center justify-center gap-2 text-sm text-steel-600">
                Saved to: <span className="font-medium text-steel-800">{STORAGE_PROVIDER_LABEL}</span>
              </p>
              {/* Opaque backend-minted token — never a Drive path or key */}
              <p className="font-mono text-[11px] text-steel-400">ID {storedDoc.storageFileId}</p>
            </>
          )}
        </div>
        <div className="mt-6 flex flex-col justify-center gap-2 sm:flex-row">
          <Button variant="secondary" onClick={resetAll}>
            Submit another task
          </Button>
          <Link to="/internee/my-submissions">
            <Button className="w-full sm:w-auto">View my submissions</Button>
          </Link>
        </div>
      </Card>
    );
  }

  // --- Form ------------------------------------------------------------------
  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <Card>
        <CardHeader
          title={CURRENT_TASK.title}
          subtitle="Assigned via WhatsApp"
          action={<Badge status={CURRENT_TASK.status} />}
        />
        <div className="flex items-center gap-2 text-sm text-steel-500">
          <CalendarClock className="h-4 w-4" />
          Deadline: {formatDate(CURRENT_TASK.deadline)} at {formatTime(CURRENT_TASK.deadline)}
        </div>
      </Card>

      <Card>
        <CardHeader title="Submit your work" subtitle="Choose one submission method" />

        <div className="mb-5 grid grid-cols-2 gap-1 rounded-lg bg-steel-100 p-1">
          {TABS.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              type="button"
              onClick={() => setTab(id)}
              aria-pressed={tab === id}
              className={`flex items-center justify-center gap-1.5 rounded-md py-2 text-sm font-medium transition-colors ${
                tab === id ? "bg-white text-steel-900 shadow-xs" : "text-steel-500 hover:text-steel-700"
              }`}
            >
              <Icon className="h-4 w-4" /> {label}
            </button>
          ))}
        </div>

        {tab === "pdf" ? (
          <div>
            {!file ? (
              <div
                onDragOver={(e) => {
                  e.preventDefault();
                  setDragOver(true);
                }}
                onDragLeave={() => setDragOver(false)}
                onDrop={(e) => {
                  e.preventDefault();
                  setDragOver(false);
                  handleFilePick(e.dataTransfer.files?.[0]);
                }}
                onClick={() => inputRef.current?.click()}
                className={`flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed px-6 py-12 text-center transition-colors ${
                  dragOver ? "border-brand-400 bg-brand-50" : "border-steel-300 bg-steel-50/50 hover:bg-steel-50"
                }`}
              >
                <UploadCloud className={`mb-3 h-8 w-8 ${dragOver ? "text-brand-500" : "text-steel-400"}`} />
                <p className="text-sm font-medium text-steel-700">Drag and drop your PDF here</p>
                <p className="mt-1 text-xs text-steel-400">PDF only, up to 20 MB</p>
                <Button
                  variant="secondary"
                  size="sm"
                  icon={FileUp}
                  className="mt-4"
                  onClick={(e) => {
                    e.stopPropagation();
                    inputRef.current?.click();
                  }}
                >
                  Browse file
                </Button>
              </div>
            ) : (
              <div className="flex items-center justify-between gap-3 rounded-lg border border-steel-200 bg-steel-50 px-4 py-3">
                <div className="flex min-w-0 items-center gap-3">
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-red-50">
                    <FileText className="h-5 w-5 text-red-500" />
                  </span>
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-steel-800" title={file.name}>
                      {file.name}
                    </p>
                    <p className="text-xs text-steel-400">{formatFileSize(file.size)}</p>
                  </div>
                </div>
                <div className="flex shrink-0 items-center gap-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    icon={RefreshCw}
                    onClick={() => inputRef.current?.click()}
                  >
                    Replace
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    icon={Trash2}
                    aria-label="Remove file"
                    onClick={() => {
                      setFile(null);
                      if (inputRef.current) inputRef.current.value = "";
                    }}
                  >
                    Remove
                  </Button>
                </div>
              </div>
            )}
            <input
              ref={inputRef}
              type="file"
              accept="application/pdf,.pdf"
              className="hidden"
              onChange={(e) => handleFilePick(e.target.files?.[0])}
            />
            {fileError && (
              <p className="mt-2 inline-flex items-center gap-1.5 text-xs font-medium text-red-600">
                <AlertCircle className="h-3.5 w-3.5" /> {fileError}
              </p>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            <Input
              label="Repository URL"
              icon={GitBranch}
              placeholder="https://github.com/username/repository"
              value={githubUrl}
              onChange={(e) => {
                setGithubUrl(e.target.value);
                if (urlError) setUrlError("");
              }}
              error={githubUrl && !isValidGithubUrl(githubUrl) ? "Enter a valid GitHub repository URL, e.g. https://github.com/user/repo" : ""}
            />
            <Textarea
              label="Note (optional)"
              name="submissionNote"
              placeholder="Anything your reviewer should know about this submission…"
              value={note}
              onChange={(e) => setNote(e.target.value)}
            />
          </div>
        )}

        <Button
          className="mt-5 w-full"
          size="lg"
          disabled={!canContinue}
          onClick={() => {
            setProgress(0);
            setConfirmOpen(true);
          }}
        >
          Continue
        </Button>
      </Card>

      {/* Confirmation + simulated upload */}
      <Modal open={confirmOpen} onClose={() => !uploading && setConfirmOpen(false)} title="Confirm submission">
        {uploading ? (
          <div className="py-2">
            <p className="text-sm font-medium text-steel-800">Uploading your submission…</p>
            <div className="mt-3 h-2 overflow-hidden rounded-full bg-steel-100">
              <div
                className="h-full rounded-full bg-brand-600 transition-all duration-150"
                style={{ width: `${progress}%` }}
              />
            </div>
            <p className="mt-2 text-right text-xs text-steel-400">{progress}%</p>
          </div>
        ) : (
          <>
            <div className="divide-y divide-steel-100 rounded-lg border border-steel-200">
              <DetailRow label="Task reference">
                <span className="max-w-[240px] truncate" title={CURRENT_TASK.title}>
                  {CURRENT_TASK.title}
                </span>
              </DetailRow>
              <DetailRow label="Type">{tab === "pdf" ? "PDF document" : "GitHub repository"}</DetailRow>
              <DetailRow label={tab === "pdf" ? "File" : "Repository"}>
                {tab === "pdf" ? (
                  `${file?.name ?? ""} · ${formatFileSize(file?.size)}`
                ) : (
                  repoFromUrl(githubUrl)
                )}
              </DetailRow>
              <DetailRow label="Deadline">
                {formatDate(CURRENT_TASK.deadline)} at {formatTime(CURRENT_TASK.deadline)}
              </DetailRow>
              {tab === "github" && note.trim() && <DetailRow label="Note">{note.trim()}</DetailRow>}
            </div>
            <p className="mt-3 inline-flex items-start gap-1.5 text-xs text-steel-500">
              <ClipboardList className="mt-0.5 h-3.5 w-3.5 shrink-0" />
              Attendance is determined by the server from the submission timestamp vs the deadline.
            </p>
            <div className="mt-4 flex justify-end gap-2 border-t border-steel-100 pt-4">
              <Button variant="secondary" onClick={() => setConfirmOpen(false)}>
                Cancel
              </Button>
              <Button onClick={() => setUploading(true)}>Submit now</Button>
            </div>
          </>
        )}
      </Modal>
    </div>
  );
}
