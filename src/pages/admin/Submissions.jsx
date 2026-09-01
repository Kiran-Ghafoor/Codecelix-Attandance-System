import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ExternalLink, FileText, GitBranch, Inbox, Search, X } from "lucide-react";
import { Card, CardHeader } from "../../components/ui/Card";
import { Table, THead, TRow, TCell } from "../../components/ui/Table";
import Avatar from "../../components/ui/Avatar";
import Badge from "../../components/ui/Badge";
import Button from "../../components/ui/Button";
import Input from "../../components/ui/Input";
import Select from "../../components/ui/Select";
import EmptyState from "../../components/ui/EmptyState";
import Skeleton from "../../components/ui/Skeleton";
import { useBatches } from "../../context/BatchesContext";
import { useInternees } from "../../context/InterneesContext";
import { apiRequest } from "../../lib/api";
import { buildDomainIndex, getInterneeById } from "../../lib/relations";
import { formatTime } from "../../lib/format";
import { isValidDateString } from "../../lib/dateUtils";

const STATUS_OPTIONS = [
  { value: "all", label: "All statuses" },
  { value: "on-time", label: "On time" },
];

function entryFor(submission, domainIndex) {
  return (
    domainIndex.get(submission.domainId) ??
    domainIndex.get(getInterneeById(submission.interneeId)?.domainId)
  );
}

function repoFromUrl(url) {
  try {
    return new URL(url).pathname.split("/").filter(Boolean).slice(0, 2).join("/") || url;
  } catch {
    return url;
  }
}

const ROW_TINT = {
  "on-time": "bg-emerald-50/50",
};

function SkeletonTable() {
  return (
    <Table>
      <THead columns={["Internee", "Batch", "Domain", "Task", "Submission", "Submitted", "Status", "Review"]} />
      <tbody>
        {Array.from({ length: 6 }).map((_, i) => (
          <TRow key={i}>
            <TCell>
              <div className="flex items-center gap-2.5">
                <Skeleton className="h-8 w-8 shrink-0 rounded-full" />
                <Skeleton className="h-4 w-28" />
              </div>
            </TCell>
            <TCell><Skeleton className="h-4 w-16" /></TCell>
            <TCell><Skeleton className="h-4 w-20" /></TCell>
            <TCell><Skeleton className="h-4 w-36" /></TCell>
            <TCell><Skeleton className="h-6 w-24 rounded-full" /></TCell>
            <TCell><Skeleton className="h-4 w-28" /></TCell>
            <TCell><Skeleton className="h-5 w-16 rounded-full" /></TCell>
            <TCell><Skeleton className="h-7 w-16 rounded-lg" /></TCell>
          </TRow>
        ))}
      </tbody>
    </Table>
  );
}

export default function Submissions() {
  const navigate = useNavigate();
  const { batches } = useBatches();
  const { internees: roster } = useInternees();
  const [batchFilter, setBatchFilter] = useState("all");
  const [domainFilter, setDomainFilter] = useState("all");
  const [interneeFilter, setInterneeFilter] = useState("all");
  const [dateFilter, setDateFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);

  const domainIndex = useMemo(() => buildDomainIndex(batches), [batches]);

  const batchOptions = [{ value: "all", label: "All batches" }, ...batches.map((b) => ({ value: b.id, label: b.batchCode }))];

  const visibleDomains = useMemo(
    () =>
      batches
        .filter((b) => batchFilter === "all" || b.id === batchFilter)
        .flatMap((b) => b.domains.map((d) => ({ batch: b, domain: d }))),
    [batches, batchFilter],
  );

  const domainOptions = [
    { value: "all", label: "All domains" },
    ...visibleDomains.map(({ batch: b, domain: d }) => ({
      value: d.id,
      label: batchFilter === "all" ? `${d.name} (${b.batchCode})` : d.name,
    })),
  ];

  const interneeOptions = useMemo(
    () => [
      { value: "all", label: "All internees" },
      ...[...roster]
        .sort((a, b) => a.name.localeCompare(b.name))
        .map((i) => ({ value: i.id, label: i.name })),
    ],
    [roster],
  );

  function handleBatchChange(event) {
    setBatchFilter(event.target.value);
    setDomainFilter("all");
  }

  const hasActiveFilters = batchFilter !== "all" || domainFilter !== "all" || interneeFilter !== "all" || dateFilter !== "" || statusFilter !== "all";

  function clearFilters() {
    setBatchFilter("all");
    setDomainFilter("all");
    setInterneeFilter("all");
    setDateFilter("");
    setStatusFilter("all");
  }

  useEffect(() => {
    let cancelled = false;
    async function load() {
      setLoading(true);
      const params = new URLSearchParams();
      if (batchFilter !== "all") params.set("batchId", batchFilter);
      if (domainFilter !== "all") params.set("domainId", domainFilter);
      if (statusFilter !== "all") params.set("status", statusFilter);
      if (dateFilter && isValidDateString(dateFilter)) params.set("date", dateFilter);
      const qs = params.toString();
      try {
        const data = await apiRequest(`/submissions${qs ? `?${qs}` : ""}`);
        if (!cancelled) setSubmissions(Array.isArray(data.submissions) ? data.submissions : []);
      } catch {
        if (!cancelled) setSubmissions([]);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => { cancelled = true; };
  }, [batchFilter, domainFilter, statusFilter, dateFilter]);

  const filtered = useMemo(() => {
    return submissions.filter((s) => interneeFilter === "all" || s.interneeId === interneeFilter);
  }, [submissions, interneeFilter]);

  return (
    <div className="space-y-5">
      {/* ── Filters ─────────────────────────────────────────────── */}
      <Card>
        <div className="space-y-4">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
            <Select label="Batch" options={batchOptions} value={batchFilter} onChange={handleBatchChange} />
            <Select label="Domain" options={domainOptions} value={domainFilter} onChange={(e) => setDomainFilter(e.target.value)} />
            <Select label="Internee" options={interneeOptions} value={interneeFilter} onChange={(e) => setInterneeFilter(e.target.value)} />
            <Input label="Date" type="date" name="submissionDate" value={dateFilter} onChange={(e) => setDateFilter(e.target.value)} />
            <Select label="Attendance" options={STATUS_OPTIONS} value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} />
          </div>

          {hasActiveFilters && (
            <div className="flex items-center gap-2 border-t border-steel-100 pt-3">
              <span className="text-[12px] font-medium text-steel-400">Filters active</span>
              <button
                onClick={clearFilters}
                className="inline-flex items-center gap-1 rounded-md px-1.5 py-0.5 text-[12px] font-medium text-brand-600 transition-colors hover:bg-brand-50 hover:text-brand-700"
              >
                <X className="h-3 w-3" /> Clear
              </button>
            </div>
          )}
        </div>
      </Card>

      {/* ── Table ───────────────────────────────────────────────── */}
      <Card padded={false}>
        <div className="px-5 pt-5 pb-0 sm:px-6">
          <CardHeader title="Submissions" subtitle={`${filtered.length} of ${submissions.length} shown`} />
        </div>
        <div className="p-5 pt-0 sm:p-6 sm:pt-0">
          {loading ? (
            <SkeletonTable />
          ) : filtered.length > 0 ? (
            <Table>
              <THead columns={["Internee", "Batch", "Domain", "Task", "Submission", "Submitted", "Status", "Review"]} />
              <tbody>
                {filtered.map((s) => {
                  const internee = findInternee(s, roster);
                  const entry = entryFor(s, domainIndex);
                  return (
                    <TRow
                      key={s.id}
                      className={`cursor-pointer ${ROW_TINT[s.status] ?? ""}`}
                      onClick={() => navigate(`/admin/submissions/${s.id}`)}
                    >
                      {/* Internee */}
                      <TCell>
                        <span className="inline-flex items-center gap-2.5">
                          {internee && <Avatar person={internee} />}
                          <span className="font-medium text-steel-800">{s.internee ?? internee?.name ?? "Unknown"}</span>
                        </span>
                      </TCell>

                      {/* Batch */}
                      <TCell className="text-steel-600">
                        {s.batch ?? entry?.batch.batchCode ?? <span className="text-steel-300">—</span>}
                      </TCell>

                      {/* Domain */}
                      <TCell className="text-steel-600">
                        {entry?.domain.name ?? <span className="text-steel-300">—</span>}
                      </TCell>

                      {/* Task */}
                      <TCell className="max-w-[220px]">
                        <span className="block truncate font-medium text-steel-800" title={s.taskRef}>
                          {s.taskRef}
                        </span>
                      </TCell>

                      {/* Submission type + file/link */}
                      <TCell>
                        {s.type === "pdf" && s.fileName ? (
                          <span className="inline-flex items-center gap-1.5 text-[12px]">
                            <span className="inline-flex items-center gap-1 rounded-full bg-red-50 px-2 py-0.5 text-[11px] font-semibold text-red-700 ring-1 ring-inset ring-red-600/10">
                              <FileText className="h-3 w-3" strokeWidth={2} />
                              File
                            </span>
                            <span className="hidden truncate text-steel-500 sm:inline" title={s.fileName}>
                              {s.fileName}
                            </span>
                          </span>
                        ) : s.type === "github" && s.githubUrl ? (
                          <span className="inline-flex items-center gap-1.5 text-[12px]">
                            <span className="inline-flex items-center gap-1 rounded-full bg-brand-50 px-2 py-0.5 text-[11px] font-semibold text-brand-700 ring-1 ring-inset ring-brand-600/10">
                              <GitBranch className="h-3 w-3" strokeWidth={2} />
                              GitHub
                            </span>
                            <a
                              href={s.githubUrl}
                              target="_blank"
                              rel="noreferrer"
                              onClick={(e) => e.stopPropagation()}
                              className="hidden items-center gap-1 truncate text-brand-600 underline-offset-2 hover:underline sm:inline-flex"
                              title={repoFromUrl(s.githubUrl)}
                            >
                              {repoFromUrl(s.githubUrl)}
                              <ExternalLink className="h-3 w-3 shrink-0" />
                            </a>
                          </span>
                        ) : (
                          <span className="text-steel-300">—</span>
                        )}
                      </TCell>

                      {/* Submitted time */}
                      <TCell className="tabular-nums text-steel-500">
                        {s.submittedAt ? (
                          <span className="font-medium">{formatTime(s.submittedAt)}</span>
                        ) : (
                          <span className="text-steel-300">—</span>
                        )}
                      </TCell>

                      {/* Attendance status */}
                      <TCell>
                        <Badge status={s.status === "on-time" ? "present" : s.status} />
                      </TCell>

                      {/* Review/View action */}
                      <TCell>
                        <Button
                          variant="secondary"
                          size="sm"
                          icon={s.type === "pdf" ? FileText : s.type === "github" ? GitBranch : Search}
                          onClick={(e) => {
                            e.stopPropagation();
                            navigate(`/admin/submissions/${s.id}`);
                          }}
                        >
                          Review
                        </Button>
                      </TCell>
                    </TRow>
                  );
                })}
              </tbody>
            </Table>
          ) : hasActiveFilters ? (
            <EmptyState
              icon={Search}
              title="No submissions match your filters"
              description="Try adjusting your search or clearing some filters to see results."
              action={
                <Button variant="secondary" icon={X} onClick={clearFilters}>
                  Clear all filters
                </Button>
              }
            />
          ) : (
            <EmptyState
              icon={Inbox}
              title="No submissions yet"
              description="Submissions will appear here once internees start turning in their work."
            />
          )}
        </div>
      </Card>
    </div>
  );
}

function findInternee(s, roster) {
  if (!s) return null;
  return getInterneeById(s.interneeId, roster);
}
