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
import Skeleton from "../../components/ui/Skeleton";
import { apiRequest, API_BASE_URL } from "../../lib/api";
import { formatDate, formatFileSize, formatTime } from "../../lib/format";
import { isWeekend, getDayName, todayISODate } from "../../lib/dateUtils";

const TABS = [
  { id: "pdf", label: "Upload file", icon: FileText },
  { id: "github", label: "GitHub repository", icon: GitBranch },
];

const MAX_FILE_BYTES = 20 * 1024 * 1024;
const GITHUB_URL_PATTERN = /^https:\/\/(www\.)?github\.com\/[\w.-]+\/[\w.-]+([/?#][^\s]*)?$/i;

const ALLOWED_EXTENSIONS = /\.(pdf|doc|docx|xls|xlsx|ppt|pptx|txt|csv|png|jpe?g|gif|webp|bmp)$/i;
const FILE_ACCEPT =
  "application/pdf,.pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt,.csv," +
  "image/png,.png,image/jpeg,.jpg,.jpeg,image/gif,.gif,image/webp,.webp,image/bmp,.bmp";

function validateFile(file) {
  const okExt = ALLOWED_EXTENSIONS.test(file.name);
  const okMime = file.type.startsWith("image/") || file.type === "application/pdf" || file.type.startsWith("text/");
  if (!okExt && !okMime) {
    return "Unsupported file type. You can upload PDF, Word, Excel, PowerPoint, text, CSV, or images.";
  }
  if (file.size > MAX_FILE_BYTES) return "File is too large — the limit is 20 MB.";
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
  const [task, setTask] = useState(null);
  const [tab, setTab] = useState("pdf");
  const [file, setFile] = useState(null);
  const [dragOver, setDragOver] = useState(false);
  const [fileError, setFileError] = useState("");
  const [githubUrl, setGithubUrl] = useState("");
  const [urlError, setUrlError] = useState("");
  const [note, setNote] = useState("");
  const [title, setTitle] = useState("");
  const [titleError, setTitleError] = useState("");
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [done, setDone] = useState(false);
  const [attendanceStatus, setAttendanceStatus] = useState(null);
  const inputRef = useRef(null);

  const today = todayISODate();

  useEffect(() => {
    let cancelled = false;
    async function load() {
      let taskData = null;
      try {
        taskData = await apiRequest("/tasks/current");
      } catch {
        taskData = null;
      }
      if (cancelled) return;
      setTask(taskData);

      try {
        const subsRes = await apiRequest("/me/submissions");
        if (cancelled) return;
        const todaySub = subsRes?.submissions?.find((s) => s.date === today);
        if (todaySub) {
          setAttendanceStatus("present");
          setDone(true);
        }
      } catch {
        // ignore — the form stays usable; a submit attempt beyond one per day is rejected server-side.
      }
    }
    load();
    return () => { cancelled = true; };
  }, [today]);

  function handleFilePick(nextFile) {
    if (!nextFile) return;
    const error = validateFile(nextFile);
    if (error) {
      setFileError(error);
      return;
    }
    setFileError("");
    setFile(nextFile);
  }

  const canContinue = tab === "pdf" ? Boolean(file) && !fileError : isValidGithubUrl(githubUrl);

  async function submit() {
    setSubmitting(true);
    setSubmitError("");
    try {
      let data;
      if (tab === "pdf") {
        const formData = new FormData();
        formData.append("type", "pdf");
        formData.append("title", title.trim());
        formData.append("file", file);
        if (note.trim()) formData.append("note", note.trim());
        const res = await fetch(`${API_BASE_URL}/submissions`, {
          method: "POST",
          credentials: "include",
          body: formData,
        });
        data = await res.json().catch(() => ({}));
        if (!res.ok) throw new Error(data.message || `Submission failed (${res.status})`);
      } else {
        data = await apiRequest("/submissions", {
          method: "POST",
          body: { type: "github", title: title.trim(), githubUrl: githubUrl.trim(), note: note.trim() || undefined },
        });
      }
      setAttendanceStatus(data.attendanceStatus ?? null);
      setConfirmOpen(false);
      setDone(true);
    } catch (err) {
      setSubmitError(err.message);
    } finally {
      setSubmitting(false);
    }
  }

  // --- Loading task ---------------------------------------------------------
  if (task === null && !done) {
    return (
      <div className="mx-auto max-w-2xl space-y-6">
        <Skeleton className="h-[140px] w-full rounded-xl" />
        <Skeleton className="h-[300px] w-full rounded-xl" />
      </div>
    );
  }

  // --- Weekend block -----------------------------------------------------------
  if (isWeekend(today)) {
    return (
      <div className="mx-auto max-w-lg space-y-6">
        <Card className="text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-steel-100">
            <CalendarClock className="h-7 w-7 text-steel-400" />
          </div>
          <h2 className="font-display text-lg font-semibold text-steel-900">Submissions Closed</h2>
          <p className="mt-2 text-sm text-steel-500">
            Today is <span className="font-medium text-steel-700">{getDayName(today)}</span> — submissions are closed on
            weekends (Saturday &amp; Sunday).
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
          <p className="flex items-center justify-center gap-2 text-sm text-steel-600">
            Attendance:{" "}
            <Badge status={attendanceStatus === "present" ? "present" : "pending"} />
          </p>
        </div>
        <div className="mt-6 flex flex-col justify-center gap-2 sm:flex-row">
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
      {/* Deadline banner (task title is withheld — tasks are announced externally) */}
      <div className="flex items-center gap-2 rounded-xl border border-steel-200 bg-white px-4 py-3 text-sm text-steel-600 shadow-card">
        <CalendarClock className="h-4 w-4 shrink-0 text-steel-400" />
        {task?.deadline ? (
          <span>
            Deadline: {formatDate(task.deadline)} at {formatTime(task.deadline)}
          </span>
        ) : (
          <span>No deadline configured — any submission today counts as on time.</span>
        )}
      </div>

      <Card>
        <CardHeader title="Submit your work" subtitle="Choose one submission method" />

        <div className="mb-5">
          <Input
            required
            label="Task title"
            name="task-title"
            placeholder='Title of the task you completed today, e.g. "Movie Ticket Booking App"'
            value={title}
            onChange={(e) => {
              setTitle(e.target.value);
              if (titleError) setTitleError("");
            }}
            onBlur={() => {
              if (!title.trim()) setTitleError("Task title is required.");
            }}
            error={titleError}
          />
        </div>

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
                <p className="text-sm font-medium text-steel-700">Drag and drop your file here</p>
                <p className="mt-1 text-xs text-steel-400">PDF, Word, Excel, images &amp; more — up to 20 MB</p>
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
                  <Button variant="ghost" size="sm" icon={RefreshCw} onClick={() => inputRef.current?.click()}>
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
              accept={FILE_ACCEPT}
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
            setSubmitError("");
            if (!title.trim()) {
              setTitleError("Task title is required.");
              return;
            }
            if (titleError) setTitleError("");
            setConfirmOpen(true);
          }}
        >
          Continue
        </Button>
      </Card>

      {/* Confirmation + upload */}
      <Modal open={confirmOpen} onClose={() => !submitting && setConfirmOpen(false)} title="Confirm submission">
        {submitting ? (
          <div className="py-2">
            <p className="text-sm font-medium text-steel-800">Uploading your submission…</p>
            <p className="mt-2 text-xs text-steel-400">This may take a moment for larger files.</p>
          </div>
        ) : (
          <>
            <div className="divide-y divide-steel-100 rounded-lg border border-steel-200">
              <DetailRow label="Type">{tab === "pdf" ? "File upload" : "GitHub repository"}</DetailRow>
              <DetailRow label={tab === "pdf" ? "File" : "Repository"}>
                {tab === "pdf" ? `${file?.name ?? ""} · ${formatFileSize(file?.size)}` : repoFromUrl(githubUrl)}
              </DetailRow>
              {task?.deadline ? (
                <DetailRow label="Deadline">
                  {formatDate(task.deadline)} at {formatTime(task.deadline)}
                </DetailRow>
              ) : (
                <DetailRow label="Deadline">No deadline configured</DetailRow>
              )}
              {tab === "github" && note.trim() && <DetailRow label="Note">{note.trim()}</DetailRow>}
            </div>
            <p className="mt-3 inline-flex items-start gap-1.5 text-xs text-steel-500">
              <ClipboardList className="mt-0.5 h-3.5 w-3.5 shrink-0" />
              Attendance is determined by the server from the submission timestamp vs the deadline.
            </p>
            {submitError && (
              <p className="mt-3 inline-flex items-start gap-1.5 text-xs font-medium text-red-600">
                <AlertCircle className="mt-0.5 h-3.5 w-3.5 shrink-0" /> {submitError}
              </p>
            )}
            <div className="mt-4 flex justify-end gap-2 border-t border-steel-100 pt-4">
              <Button variant="secondary" onClick={() => setConfirmOpen(false)}>
                Cancel
              </Button>
              <Button onClick={submit}>Submit now</Button>
            </div>
          </>
        )}
      </Modal>
    </div>
  );
}
