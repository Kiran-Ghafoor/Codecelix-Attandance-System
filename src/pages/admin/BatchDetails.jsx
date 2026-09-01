import { useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Check, ChevronRight, Copy, KeyRound, Layers, Pencil, Power, UserCheck, UserX, Users } from "lucide-react";
import { Card, CardHeader, StatCard } from "../../components/ui/Card";
import Avatar from "../../components/ui/Avatar";
import Badge from "../../components/ui/Badge";
import Button from "../../components/ui/Button";
import EmptyState from "../../components/ui/EmptyState";
import BatchFormModal from "../../components/batches/BatchFormModal";
import { useBatches } from "../../context/BatchesContext";
import { useInternees } from "../../context/InterneesContext";
import { getDomainLeader } from "../../lib/relations";
import { formatDate } from "../../lib/format";

export default function BatchDetails() {
  const { batchId } = useParams();
  const navigate = useNavigate();
  const { batches, updateBatch, toggleBatchStatus, isDuplicateCode } = useBatches();
  const { internees: roster } = useInternees();
  const [editOpen, setEditOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  const batch = batches.find((b) => b.id === batchId);

  function copyRegistrationCode() {
    if (!batch?.registrationCode) return;
    navigator.clipboard?.writeText(batch.registrationCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }

  if (!batch) {
    return (
      <EmptyState
        title="Batch not found"
        description="This batch doesn't exist or may have been removed."
        action={
          <Button variant="secondary" icon={ArrowLeft} onClick={() => navigate("/admin/batches")}>
            Back to batches
          </Button>
        }
      />
    );
  }

  const isActive = batch.status === "Active";
  const batchRoster = roster.filter((i) => i.batchId === batch.id);
  const verifiedCount = batchRoster.length;

  return (
    <div className="space-y-5">
      <div>
        <Link
          to="/admin/batches"
          className="inline-flex items-center gap-1.5 text-[13px] font-medium text-steel-500 transition-colors hover:text-brand-700"
        >
          <ArrowLeft className="h-3.5 w-3.5" /> Back to batches
        </Link>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="font-display text-xl font-bold text-steel-900">{batch.batchCode}</h1>
            <Badge status={batch.status.toLowerCase()} />
            <Badge status={(batch.mode || "Onsite").toLowerCase()} />
          </div>
          <p className="mt-1 text-[13px] text-steel-500">
            Batch {batch.batchNumber} &middot; {batch.program} &middot; {batch.year} &middot;{" "}
            {formatDate(batch.startDate)} — {formatDate(batch.endDate)}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="secondary" icon={Pencil} onClick={() => setEditOpen(true)}>
            Edit batch
          </Button>
          <Button
            variant={isActive ? "danger" : "primary"}
            icon={Power}
            onClick={() => toggleBatchStatus(batch.id)}
          >
            {isActive ? "Deactivate" : "Activate"}
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Total registered internees" value={batch.internCount ?? batchRoster.length} icon={Users} tone="brand" />
        <StatCard label="Verified internees" value={verifiedCount} icon={UserCheck} tone="green" />
        <StatCard label="Unverified registrations" value={0} icon={UserX} tone="amber" />
        <StatCard label="Total domains" value={batch.domains.length} icon={Layers} tone="steel" />
      </div>

      <Card>
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-start gap-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-brand-100/80 bg-brand-50 text-brand-600">
              <KeyRound className="h-[16px] w-[16px]" strokeWidth={1.8} />
            </div>
            <div className="min-w-0">
              <p className="text-[12px] font-medium text-steel-400">Internee Registration Code</p>
              <p className="mt-0.5 break-all font-display text-[18px] font-bold tracking-tight text-steel-900">{batch.registrationCode}</p>
              <p className="mt-1 text-[12px] text-steel-400">
                Share this code with internees so they can register for this batch. Not shown on public pages.
              </p>
            </div>
          </div>
          <Button variant="secondary" icon={copied ? Check : Copy} onClick={copyRegistrationCode}>
            {copied ? "Copied" : "Copy"}
          </Button>
        </div>
      </Card>

      <Card padded={false}>
        <div className="px-5 pt-5 pb-0 sm:px-6">
          <CardHeader title="Domains" subtitle="Select a domain to view its team leader and internees" />
        </div>
        <div className="p-5 pt-0 sm:p-6 sm:pt-0">
          {batch.domains.length > 0 ? (
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3">
              {batch.domains.map((domain) => {
                const leader = getDomainLeader(domain.teamLeaderId, roster);
                const domainInternees = roster.filter((i) => i.domainId === domain.id);
                return (
                  <Link
                    key={domain.id}
                    to={`/admin/batches/${batch.id}/domains/${domain.id}`}
                    className="group flex flex-col rounded-xl border border-steel-200/60 bg-white p-4 shadow-card transition-all duration-200 hover:border-brand-300 hover:shadow-card-hover"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <h4 className="font-display text-[14px] font-bold text-steel-900 group-hover:text-brand-700">{domain.name}</h4>
                      <ChevronRight className="h-4 w-4 shrink-0 text-steel-300 transition-colors group-hover:text-brand-600" />
                    </div>
                    <div className="mt-3 flex items-center gap-2.5">
                      <Avatar person={leader} />
                      <div className="min-w-0">
                        <p className="truncate text-[13px] font-medium text-steel-800">{leader ? leader.name : "Unassigned"}</p>
                        <p className="text-[11px] text-steel-400">Team Leader</p>
                      </div>
                    </div>
                    <div className="mt-auto pt-3 border-t border-steel-100">
                      <p className="inline-flex items-center gap-1.5 text-[13px] text-steel-600">
                        <Users className="h-3.5 w-3.5 text-steel-400" />
                        {domainInternees.length} Internees
                      </p>
                    </div>
                  </Link>
                );
              })}
            </div>
          ) : (
            <EmptyState
              icon={Layers}
              title="No domains yet"
              description="Add domains to this batch to start organising internees."
              action={
                <Button variant="secondary" icon={Pencil} onClick={() => setEditOpen(true)}>
                  Edit batch
                </Button>
              }
            />
          )}
        </div>
      </Card>

      <BatchFormModal
        open={editOpen}
        onClose={() => setEditOpen(false)}
        title="Edit batch"
        initial={batch}
        onSubmit={(payload) => updateBatch(batch.id, payload)}
        isDuplicateCode={isDuplicateCode}
      />
    </div>
  );
}
