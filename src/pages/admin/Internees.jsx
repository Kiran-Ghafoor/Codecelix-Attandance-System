import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Eye, Search, SlidersHorizontal, UserPlus, X } from "lucide-react";
import { Card, CardHeader } from "../../components/ui/Card";
import { Table, THead, TRow, TCell } from "../../components/ui/Table";
import Avatar from "../../components/ui/Avatar";
import Badge from "../../components/ui/Badge";
import Button from "../../components/ui/Button";
import Input from "../../components/ui/Input";
import Select from "../../components/ui/Select";
import EmptyState from "../../components/ui/EmptyState";
import InterneeFormModal from "../../components/internees/InterneeFormModal";
import { useBatches } from "../../context/BatchesContext";
import { useInternees } from "../../context/InterneesContext";
import { getDomainLeader, buildDomainIndex } from "../../lib/mockData";

const STATUS_OPTIONS = [
  { value: "all", label: "All statuses" },
  { value: "active", label: "Active" },
  { value: "warning", label: "At risk" },
  { value: "completed", label: "Completed" },
];

function attendanceColor(pct) {
  if (pct >= 90) return "text-emerald-600";
  if (pct >= 75) return "text-amber-600";
  return "text-red-600";
}

export default function Internees() {
  const navigate = useNavigate();
  const { batches } = useBatches();
  const { internees, addInternee } = useInternees();
  const [addOpen, setAddOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [batchFilter, setBatchFilter] = useState("all");
  const [domainFilter, setDomainFilter] = useState("all");
  const [leaderFilter, setLeaderFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");

  const domainIndex = useMemo(() => buildDomainIndex(batches), [batches]);

  const batchOptions = [{ value: "all", label: "All batches" }, ...batches.map((b) => ({ value: b.id, label: b.name }))];

  const visibleDomains = useMemo(
    () =>
      batches
        .filter((b) => batchFilter === "all" || b.id === batchFilter)
        .flatMap((b) => b.domains.map((d) => ({ batch: b, domain: d }))),
    [batches, batchFilter]
  );

  const domainOptions = [
    { value: "all", label: "All domains" },
    ...visibleDomains.map(({ batch: b, domain: d }) => ({
      value: d.id,
      label: batchFilter === "all" ? `${d.name} (${b.name})` : d.name,
    })),
  ];

  const leaderOptions = useMemo(() => {
    const leaders = new Map();
    visibleDomains.forEach(({ domain: d }) => {
      const leader = getDomainLeader(d.teamLeaderId, internees);
      if (leader && !leaders.has(leader.id)) leaders.set(leader.id, leader);
    });
    return [{ value: "all", label: "All team leaders" }, ...[...leaders.values()].map((u) => ({ value: u.id, label: u.name }))];
  }, [visibleDomains, internees]);

  const activeFilterCount = useMemo(() => {
    let count = 0;
    if (query.trim()) count++;
    if (batchFilter !== "all") count++;
    if (domainFilter !== "all") count++;
    if (leaderFilter !== "all") count++;
    if (statusFilter !== "all") count++;
    return count;
  }, [query, batchFilter, domainFilter, leaderFilter, statusFilter]);

  function clearAllFilters() {
    setQuery("");
    setBatchFilter("all");
    setDomainFilter("all");
    setLeaderFilter("all");
    setStatusFilter("all");
  }

  function handleBatchChange(event) {
    setBatchFilter(event.target.value);
    setDomainFilter("all");
    setLeaderFilter("all");
  }

  function handleDomainChange(event) {
    setDomainFilter(event.target.value);
    setLeaderFilter("all");
  }

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return internees.filter((i) => {
      const entry = domainIndex.get(i.domainId);
      const matchesBatch = batchFilter === "all" || i.batchId === batchFilter;
      const matchesDomain = domainFilter === "all" || i.domainId === domainFilter;
      const matchesLeader = leaderFilter === "all" || entry?.domain.teamLeaderId === leaderFilter;
      const matchesStatus = statusFilter === "all" || i.status.toLowerCase() === statusFilter;
      const matchesQuery = i.name.toLowerCase().includes(q) || i.email.toLowerCase().includes(q);
      return matchesBatch && matchesDomain && matchesLeader && matchesStatus && matchesQuery;
    });
  }, [query, batchFilter, domainFilter, leaderFilter, statusFilter, domainIndex, internees]);

  return (
    <div className="space-y-5">
      <div className="space-y-3">
        <div className="flex items-center justify-between gap-3">
          <div className="flex-1 sm:max-w-sm">
            <Input
              icon={Search}
              placeholder="Search by name or email\u2026"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </div>
          <Button icon={UserPlus} onClick={() => setAddOpen(true)}>
            Add internee
          </Button>
        </div>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <Select aria-label="Filter by batch" options={batchOptions} value={batchFilter} onChange={handleBatchChange} />
          <Select aria-label="Filter by domain" options={domainOptions} value={domainFilter} onChange={handleDomainChange} />
          <Select aria-label="Filter by team leader" options={leaderOptions} value={leaderFilter} onChange={(e) => setLeaderFilter(e.target.value)} />
          <Select aria-label="Filter by status" options={STATUS_OPTIONS} value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} />
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

      <Card padded={false}>
        <div className="px-5 pt-5 pb-0 sm:px-6">
          <CardHeader title="Internees" subtitle={`${filtered.length} of ${internees.length} shown`} />
        </div>
        <div className="p-5 pt-0 sm:p-6 sm:pt-0">
          {filtered.length > 0 ? (
            <Table>
              <THead columns={["Name", "Email", "Batch", "Domain", "Team Leader", "Att. %", "Status", "View"]} />
              <tbody>
                {filtered.map((i) => {
                  const entry = domainIndex.get(i.domainId);
                  const leader = getDomainLeader(entry?.domain.teamLeaderId, internees);
                  return (
                    <TRow key={i.id} className="cursor-pointer" onClick={() => navigate(`/admin/internees/${i.id}`)}>
                      <TCell>
                        <span className="inline-flex items-center gap-2.5">
                          <Avatar person={i} />
                          <span className="font-medium text-steel-800">{i.name}</span>
                        </span>
                      </TCell>
                      <TCell className="text-steel-400 text-[12px]">{i.email}</TCell>
                      <TCell className="text-steel-700">{entry?.batch.name ?? batches.find((b) => b.id === i.batchId)?.name ?? "\u2014"}</TCell>
                      <TCell className="text-steel-700">{entry?.domain.name ?? <span className="text-steel-400">\u2014</span>}</TCell>
                      <TCell>
                        {leader ? (
                          <span className="inline-flex items-center gap-2">
                            <Avatar person={leader} size="h-6 w-6 text-[10px]" />
                            <span className="text-steel-700">{leader.name}</span>
                          </span>
                        ) : (
                          <span className="text-steel-400">\u2014</span>
                        )}
                      </TCell>
                      <TCell>
                        <span className={`tabular-nums font-medium ${attendanceColor(i.attendance)}`}>{i.attendance}%</span>
                      </TCell>
                      <TCell>
                        <Badge status={i.status.toLowerCase()} />
                      </TCell>
                      <TCell>
                        <Button
                          variant="secondary"
                          size="sm"
                          icon={Eye}
                          onClick={(e) => {
                            e.stopPropagation();
                            navigate(`/admin/internees/${i.id}`);
                          }}
                        >
                          View
                        </Button>
                      </TCell>
                    </TRow>
                  );
                })}
              </tbody>
            </Table>
          ) : activeFilterCount > 0 ? (
            <EmptyState
              icon={Search}
              title="No internees match your filters"
              description="Try adjusting your search term or clearing some filters to see results."
              action={
                <Button variant="secondary" icon={X} onClick={clearAllFilters}>
                  Clear all filters
                </Button>
              }
            />
          ) : (
            <EmptyState
              icon={SlidersHorizontal}
              title="No internees yet"
              description="Add your first internee to get started."
              action={
                <Button icon={UserPlus} onClick={() => setAddOpen(true)}>
                  Add internee
                </Button>
              }
            />
          )}
        </div>
      </Card>

      <InterneeFormModal
        open={addOpen}
        onClose={() => setAddOpen(false)}
        batches={batches}
        roster={internees}
        onSubmit={addInternee}
      />
    </div>
  );
}
