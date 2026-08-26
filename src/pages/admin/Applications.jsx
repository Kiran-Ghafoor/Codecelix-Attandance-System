import { useMemo, useState } from "react";
import { Clock, Eye, Search, SlidersHorizontal, Users, X, CheckCircle2, XCircle } from "lucide-react";
import { Card, CardHeader } from "../../components/ui/Card";
import { Table, THead, TRow, TCell } from "../../components/ui/Table";
import Badge from "../../components/ui/Badge";
import Button from "../../components/ui/Button";
import Input from "../../components/ui/Input";
import Select from "../../components/ui/Select";
import EmptyState from "../../components/ui/EmptyState";
import ApplicationDetailsModal from "../../components/applications/ApplicationDetailsModal";
import { useApplications } from "../../context/ApplicationsContext";
import { AVAILABLE_DOMAINS } from "../../lib/registration";
import { formatDate } from "../../lib/format";

const STATUS_OPTIONS = [
  { value: "all", label: "All statuses" },
  { value: "pending", label: "Pending" },
  { value: "approved", label: "Approved" },
  { value: "rejected", label: "Rejected" },
];

function maskCnic(cnic) {
  if (!cnic) return "—";
  const parts = cnic.split("-");
  if (parts.length !== 3) return cnic;
  return `${"*".repeat(parts[0].length)}-${"*".repeat(parts[1].length)}-${parts[2]}`;
}

function domainLabel(value) {
  return AVAILABLE_DOMAINS.find((d) => d.value === value)?.label ?? value;
}

export default function Applications() {
  const { applications, approveApplication, rejectApplication } = useApplications();
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selected, setSelected] = useState(null);

  const activeFilterCount = useMemo(() => {
    let count = 0;
    if (query.trim()) count++;
    if (statusFilter !== "all") count++;
    return count;
  }, [query, statusFilter]);

  function clearAllFilters() {
    setQuery("");
    setStatusFilter("all");
  }

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return applications.filter((a) => {
      const matchesStatus = statusFilter === "all" || a.status === statusFilter;
      const matchesQuery =
        a.name.toLowerCase().includes(q) ||
        a.email.toLowerCase().includes(q) ||
        a.batchCode.toLowerCase().includes(q);
      return matchesStatus && matchesQuery;
    });
  }, [query, statusFilter, applications]);

  const pendingCount = useMemo(() => applications.filter((a) => a.status === "pending").length, [applications]);

  return (
    <div className="space-y-5">
      {/* Summary cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <Card className="flex items-center gap-4 p-4">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-50">
            <Clock className="h-5 w-5 text-amber-600" />
          </div>
          <div>
            <p className="text-[12px] font-medium text-steel-500">Pending</p>
            <p className="font-display text-[22px] font-bold text-steel-900">
              {applications.filter((a) => a.status === "pending").length}
            </p>
          </div>
        </Card>
        <Card className="flex items-center gap-4 p-4">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-green-50">
            <CheckCircle2 className="h-5 w-5 text-green-600" />
          </div>
          <div>
            <p className="text-[12px] font-medium text-steel-500">Approved</p>
            <p className="font-display text-[22px] font-bold text-steel-900">
              {applications.filter((a) => a.status === "approved").length}
            </p>
          </div>
        </Card>
        <Card className="flex items-center gap-4 p-4">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-red-50">
            <XCircle className="h-5 w-5 text-red-600" />
          </div>
          <div>
            <p className="text-[12px] font-medium text-steel-500">Rejected</p>
            <p className="font-display text-[22px] font-bold text-steel-900">
              {applications.filter((a) => a.status === "rejected").length}
            </p>
          </div>
        </Card>
      </div>

      {/* Filters */}
      <div className="space-y-3">
        <div className="flex items-center justify-between gap-3">
          <div className="flex-1 sm:max-w-sm">
            <Input
              icon={Search}
              placeholder="Search by name, email or batch\u2026"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </div>
          <Select
            aria-label="Filter by status"
            options={STATUS_OPTIONS}
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-auto"
          />
        </div>

        {activeFilterCount > 0 && (
          <div className="flex items-center gap-2 text-[13px] text-steel-500">
            <SlidersHorizontal className="h-3.5 w-3.5 text-steel-400" />
            <span>
              {activeFilterCount} filter{activeFilterCount > 1 ? "s" : ""} active
            </span>
            <button
              onClick={clearAllFilters}
              className="inline-flex items-center gap-1 rounded-md px-1.5 py-0.5 text-[12px] font-medium text-brand-600 transition-colors hover:bg-brand-50 hover:text-brand-700"
            >
              <X className="h-3 w-3" /> Clear all
            </button>
          </div>
        )}
      </div>

      {/* Table */}
      <Card padded={false}>
        <div className="px-5 pt-5 pb-0 sm:px-6">
          <CardHeader
            title="Internee Applications"
            subtitle={`${filtered.length} of ${applications.length} shown${pendingCount > 0 ? ` · ${pendingCount} pending` : ""}`}
          />
        </div>
        <div className="p-5 pt-0 sm:p-6 sm:pt-0">
          {filtered.length > 0 ? (
            <Table>
              <THead columns={["Name", "Email", "CNIC", "Contact", "Batch", "Domain", "Registered", "Email Verified", "Status", "Actions"]} />
              <tbody>
                {filtered.map((a) => (
                  <TRow key={a.id} className="cursor-pointer" onClick={() => setSelected(a)}>
                    <TCell>
                      <span className="font-medium text-steel-800">{a.name}</span>
                    </TCell>
                    <TCell className="text-steel-500 text-[12px]">{a.email}</TCell>
                    <TCell className="text-steel-500 font-mono text-[12px]">{maskCnic(a.cnic)}</TCell>
                    <TCell className="text-steel-600 text-[12px]">{a.phone}</TCell>
                    <TCell className="text-steel-700">{a.batchCode}</TCell>
                    <TCell className="text-steel-700">{domainLabel(a.domain)}</TCell>
                    <TCell className="text-steel-500 text-[12px]">{formatDate(a.createdAt)}</TCell>
                    <TCell>
                      {a.emailVerified ? (
                        <Badge status="approved" />
                      ) : (
                        <Badge status="not-verified" />
                      )}
                    </TCell>
                    <TCell>
                      <Badge status={a.status} />
                    </TCell>
                    <TCell>
                      <div className="flex items-center gap-1.5" onClick={(e) => e.stopPropagation()}>
                        <Button
                          variant="secondary"
                          size="sm"
                          icon={Eye}
                          onClick={() => setSelected(a)}
                        >
                          View
                        </Button>
                        {a.status === "pending" && (
                          <>
                            <Button
                              size="sm"
                              icon={CheckCircle2}
                              className="!bg-green-600 !text-white hover:!bg-green-700"
                              onClick={() => {
                                setSelected(a);
                              }}
                            >
                              Approve
                            </Button>
                            <Button
                              variant="danger"
                              size="sm"
                              icon={XCircle}
                              onClick={() => {
                                setSelected(a);
                              }}
                            >
                              Reject
                            </Button>
                          </>
                        )}
                      </div>
                    </TCell>
                  </TRow>
                ))}
              </tbody>
            </Table>
          ) : activeFilterCount > 0 ? (
            <EmptyState
              icon={Search}
              title="No applications match your filters"
              description="Try adjusting your search term or clearing some filters to see results."
              action={
                <Button variant="secondary" icon={X} onClick={clearAllFilters}>
                  Clear all filters
                </Button>
              }
            />
          ) : (
            <EmptyState
              icon={Users}
              title="No applications yet"
              description="Internee registration applications will appear here."
            />
          )}
        </div>
      </Card>

      {/* Details modal */}
      <ApplicationDetailsModal
        open={selected !== null}
        application={selected}
        onClose={() => setSelected(null)}
        onApprove={approveApplication}
        onReject={rejectApplication}
      />
    </div>
  );
}
