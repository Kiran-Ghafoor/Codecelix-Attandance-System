import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, ExternalLink, FileText, GitBranch, RefreshCw } from "lucide-react";
import { Card, CardHeader } from "../../components/ui/Card";
import { Table, THead, TRow, TCell } from "../../components/ui/Table";
import Avatar from "../../components/ui/Avatar";
import Badge from "../../components/ui/Badge";
import Button from "../../components/ui/Button";
import DetailRow from "../../components/ui/DetailRow";
import EmptyState from "../../components/ui/EmptyState";
import Skeleton from "../../components/ui/Skeleton";
import Select from "../../components/ui/Select";
import { useBatches } from "../../context/BatchesContext";
import { useInternees } from "../../context/InterneesContext";
import { apiRequest } from "../../lib/api";
import { buildDomainIndex, getDomainLeader } from "../../lib/relations";
import { formatDate, formatTime } from "../../lib/format";

const SUMMARY_TONES = {
  present: "text-emerald-600",
  absent: "text-red-600",
};

function maskCnic(cnic) {
  if (!cnic) return "\u2014";
  const parts = cnic.split("-");
  if (parts.length !== 3) return cnic;
  return `${"*".repeat(parts[0].length)}-${"*".repeat(parts[1].length)}-${parts[2]}`;
}

export default function InterneeDetails() {
  const { interneeId } = useParams();
  const navigate = useNavigate();
  const { batches, refresh: refreshBatches } = useBatches();
  const { internees: roster, refresh: refreshInternees } = useInternees();
  const [showCnic, setShowCnic] = useState(false);
  const [summary, setSummary] = useState(null);
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [domainSel, setDomainSel] = useState("");
  const [reEnrollBatch, setReEnrollBatch] = useState("");
  const [reEnrollDomain, setReEnrollDomain] = useState("");
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState(null); // { type: "success" | "error", text }

  const internee = roster.find((i) => i.id === interneeId) ?? null;
  const domainIndex = useMemo(() => buildDomainIndex(batches), [batches]);
  const entry = internee ? domainIndex.get(internee.domainId) : null;

  useEffect(() => {
    let cancelled = false;
    async function load() {
      if (!interneeId) return;
      setLoading(true);
      try {
        const [att, subs] = await Promise.all([
          apiRequest(`/internees/${interneeId}/attendance`).catch(() => null),
          apiRequest(`/internees/${interneeId}/submissions`),
        ]);
        if (cancelled) return;
        setSummary(att?.summary ?? null);
        setSubmissions(Array.isArray(subs.submissions) ? subs.submissions : []);
      } catch {
        if (!cancelled) setSubmissions([]);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => { cancelled = true; };
  }, [interneeId]);

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
  const accountStatus = (internee.status ?? "approved").toLowerCase();

  const currentDomainName = domain?.name ?? internee.domainName ?? "";

  const domainOptions = [
    { value: "", label: "Select domain…" },
    ...(batch?.domains ?? []).map((d) => ({ value: d.id, label: d.name })),
  ];

  const batchOptions = [
    { value: "", label: "Select batch…" },
    ...batches
      .filter((b) => b.id !== batch?.id)
      .map((b) => ({ value: b.id, label: b.batchCode })),
  ];

  const reEnrollTarget = batches.find((b) => b.id === reEnrollBatch) ?? null;
  const reEnrollDomainOptions = [
    { value: "", label: reEnrollTarget ? "Select domain…" : "Choose a batch first" },
    ...(reEnrollTarget?.domains ?? []).map((d) => ({ value: d.id, label: d.name })),
  ];

  async function saveDomainChange() {
    if (!domainSel) {
      setMessage({ type: "error", text: "Select a domain first." });
      return;
    }
    setSaving(true);
    setMessage(null);
    try {
      await apiRequest(`/internees/${interneeId}`, { method: "PATCH", body: { domainId: domainSel } });
      await Promise.all([refreshInternees(), refreshBatches()]);
      setDomainSel("");
      setMessage({ type: "success", text: "Domain updated. The internee's dashboard now shows the new domain." });
    } catch (err) {
      setMessage({ type: "error", text: err?.message || "Could not update the domain." });
    } finally {
      setSaving(false);
    }
  }

  async function saveReEnroll() {
    if (!reEnrollBatch || !reEnrollDomain) {
      setMessage({ type: "error", text: "Select both a batch and a domain to re-enroll." });
      return;
    }
    setSaving(true);
    setMessage(null);
    try {
      await apiRequest(`/internees/${interneeId}`, {
        method: "PATCH",
        body: { batchId: reEnrollBatch, domainId: reEnrollDomain },
      });
      await Promise.all([refreshInternees(), refreshBatches()]);
      setReEnrollBatch("");
      setReEnrollDomain("");
      setMessage({ type: "success", text: "Re-enrolled into the new batch. The account was reused — nothing was duplicated." });
    } catch (err) {
      setMessage({ type: "error", text: err?.message || "Could not re-enroll the internee." });
    } finally {
      setSaving(false);
    }
  }

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
        <Badge status={accountStatus === "approved" ? "active" : accountStatus} />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <Card padded={false}>
          <div className="p-5 pb-0">
            <CardHeader title="Profile" />
          </div>
          <div className="p-5 pt-0">
            <div className="divide-y divide-steel-100 rounded-lg border border-steel-200">
              <DetailRow label="Batch">{batch ? batch.batchCode : "—"}</DetailRow>
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
                <Badge status={accountStatus === "approved" ? "active" : accountStatus} dot={false} />
              </DetailRow>
              {internee.phone && <DetailRow label="Phone">{internee.phone}</DetailRow>}
              {internee.cnic && (
                <DetailRow label="CNIC">
                  <span className="inline-flex items-center gap-1.5">
                    <span>{showCnic ? internee.cnic : maskCnic(internee.cnic)}</span>
                    <button
                      type="button"
                      onClick={() => setShowCnic((v) => !v)}
                      className="text-steel-400 transition-colors hover:text-steel-600"
                    >
                      {showCnic ? "Hide" : "Show"}
                    </button>
                  </span>
                </DetailRow>
              )}
              {internee.joinDate && <DetailRow label="Join date">{formatDate(internee.joinDate)}</DetailRow>}
            </div>
          </div>
        </Card>

        <Card padded={false}>
          <div className="p-5 pb-0">
            <CardHeader
              title="Assignments"
              subtitle="Change the internee's domain, or re-enroll them into a new internship batch."
            />
          </div>
          <div className="space-y-5 p-5 pt-3 sm:p-6 sm:pt-3">
            {message && (
              <div
                className={`rounded-lg border px-3 py-2 text-[13px] ${
                  message.type === "success"
                    ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                    : "border-red-200 bg-red-50 text-red-700"
                }`}
              >
                {message.text}
              </div>
            )}

            <div className="rounded-xl border border-steel-200/70 bg-steel-50/50 p-3">
              <p className="mb-2 text-[13px] font-semibold text-steel-800">Change domain</p>
              <p className="mb-3 text-[12px] text-steel-500">
                Current: <span className="font-medium text-steel-700">{currentDomainName || "\u2014"}</span> · Only domains
                within this internee's batch ({batch?.batchCode ?? "\u2014"}) are available.
              </p>
              <div className="flex flex-col gap-2 sm:flex-row sm:items-end">
                <div className="flex-1">
                  <Select
                    label="New domain"
                    aria-label="New domain"
                    options={domainOptions}
                    value={domainSel}
                    disabled={!batch}
                    onChange={(e) => setDomainSel(e.target.value)}
                  />
                </div>
                <Button variant="secondary" icon={RefreshCw} loading={saving} disabled={!domainSel} onClick={saveDomainChange}>
                  Change domain
                </Button>
              </div>
            </div>

            <div className="rounded-xl border border-steel-200/70 bg-steel-50/50 p-3">
              <p className="mb-2 text-[13px] font-semibold text-steel-800">Re-enroll into a new batch</p>
              <p className="mb-3 text-[12px] text-steel-500">
                Use this for a previous internee starting their next internship. The account is moved to the new batch
                (no duplicate registration), and the join date is reset to today.
              </p>
              <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 sm:items-end">
                <Select
                  label="New batch"
                  aria-label="New batch"
                  options={batchOptions}
                  value={reEnrollBatch}
                  onChange={(e) => {
                    setReEnrollBatch(e.target.value);
                    setReEnrollDomain("");
                  }}
                />
                <Select
                  label="Domain in new batch"
                  aria-label="Domain in new batch"
                  options={reEnrollDomainOptions}
                  value={reEnrollDomain}
                  disabled={!reEnrollTarget}
                  onChange={(e) => setReEnrollDomain(e.target.value)}
                />
              </div>
              <div className="mt-3 flex justify-end">
                <Button variant="primary" icon={RefreshCw} loading={saving} disabled={!reEnrollBatch || !reEnrollDomain} onClick={saveReEnroll}>
                  Re-enroll
                </Button>
              </div>
            </div>
          </div>
        </Card>
        </div>

        <Card>
          <CardHeader
            title="Attendance summary"
            subtitle={summary ? `Based on the last ${summary.totalDays} working days` : "Loading\u2026"}
          />
          <div className="flex flex-wrap items-center gap-6">
            <div>
              <p className="font-display text-[36px] font-bold leading-none text-brand-700">
                {summary ? `${summary.percentage}%` : "—"}
              </p>
              <p className="mt-1.5 text-[13px] text-steel-500">Overall attendance</p>
            </div>
            <div className="grid flex-1 grid-cols-2 gap-3">
              {[
                ["Present", summary?.present ?? "—", "present"],
                ["Absent", summary?.absent ?? "—", "absent"],
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
          {loading ? (
            <div className="space-y-3">
              {Array.from({ length: 4 }).map((_, i) => (
                <Skeleton key={i} className="h-12 w-full rounded-lg" />
              ))}
            </div>
          ) : submissions.length > 0 ? (
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
                      <Badge status={s.status === "on-time" ? "present" : s.status} />
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
