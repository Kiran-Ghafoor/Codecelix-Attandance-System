import { Link, useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Eye, Layers, Mail, Users } from "lucide-react";
import { Card, CardHeader, StatCard } from "../../components/ui/Card";
import { Table, THead, TRow, TCell } from "../../components/ui/Table";
import Avatar from "../../components/ui/Avatar";
import Badge from "../../components/ui/Badge";
import Button from "../../components/ui/Button";
import EmptyState from "../../components/ui/EmptyState";
import { useBatches } from "../../context/BatchesContext";
import { useInternees } from "../../context/InterneesContext";
import { getDomainLeader } from "../../lib/relations";

export default function DomainDetails() {
  const { batchId, domainId } = useParams();
  const navigate = useNavigate();
  const { batches } = useBatches();
  const { internees: roster } = useInternees();

  const batch = batches.find((b) => b.id === batchId);
  const domain = batch?.domains.find((d) => d.id === domainId);

  const internees = domain ? roster.filter((i) => i.domainId === domain.id) : [];
  const leader = getDomainLeader(domain?.teamLeaderId, roster);

  if (!batch || !domain) {
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
        <EmptyState
          icon={Layers}
          title="Domain not found"
          description="This domain doesn't exist or may have been removed."
          action={
            <Button variant="secondary" icon={ArrowLeft} onClick={() => navigate(batch ? `/admin/batches/${batch.id}` : "/admin/batches")}>
              Back
            </Button>
          }
        />
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <div>
        <Link
          to={`/admin/batches/${batch.id}`}
          className="inline-flex items-center gap-1.5 text-[13px] font-medium text-steel-500 transition-colors hover:text-brand-700"
        >
          <ArrowLeft className="h-3.5 w-3.5" /> Back to {batch.batchCode}
        </Link>
      </div>

      <div>
        <h1 className="font-display text-xl font-bold text-steel-900">{domain.name}</h1>
        <p className="mt-1 inline-flex flex-wrap items-center gap-2 text-[13px] text-steel-500">
          <span className="inline-flex items-center gap-1.5">
            <Layers className="h-3.5 w-3.5 text-steel-400" /> {batch.batchCode}
          </span>
          <span aria-hidden="true">·</span>
          <Badge status={batch.status.toLowerCase()} />
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <Card className="sm:col-span-2">
          <CardHeader title="Team Leader" />
          {leader ? (
            <div className="flex items-center gap-4">
              <Avatar person={leader} size="h-12 w-12 text-sm" />
              <div className="min-w-0">
                <p className="font-display text-[15px] font-bold text-steel-900">{leader.name}</p>
                <p className="mt-0.5 inline-flex items-center gap-1.5 truncate text-[13px] text-steel-500">
                  <Mail className="h-3.5 w-3.5 text-steel-400" /> {leader.email}
                </p>
              </div>
            </div>
          ) : (
            <p className="text-[13px] text-steel-500">No team leader assigned yet.</p>
          )}
        </Card>

        <StatCard label="Total internees" value={internees.length} icon={Users} tone="brand" />
      </div>

      <Card padded={false}>
        <div className="px-5 pt-5 pb-0 sm:px-6">
          <CardHeader title="Internees" subtitle={`${internees.length} assigned to this domain`} />
        </div>
        <div className="p-5 pt-0 sm:p-6 sm:pt-0">
          {internees.length > 0 ? (
            <Table>
              <THead columns={["Internee", "Email", "Attendance", "Status", "View"]} />
              <tbody>
                {internees.map((internee) => (
                  <TRow key={internee.id} className="cursor-pointer" onClick={() => navigate(`/admin/internees/${internee.id}`)}>
                    <TCell>
                      <span className="inline-flex items-center gap-2.5">
                        <Avatar person={internee} />
                        <span className="font-medium text-steel-800">{internee.name}</span>
                      </span>
                    </TCell>
                    <TCell className="text-steel-500">{internee.email}</TCell>
                    <TCell>{internee.attendance}%</TCell>
                    <TCell>
                      <Badge status={(internee.status ?? "approved").toLowerCase() === "approved" ? "active" : (internee.status ?? "").toLowerCase()} />
                    </TCell>
                    <TCell>
                      <Button
                        variant="secondary"
                        size="sm"
                        icon={Eye}
                        onClick={(e) => {
                          e.stopPropagation();
                          navigate(`/admin/internees/${internee.id}`);
                        }}
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
              icon={Users}
              title="No internees yet"
              description="Internees assigned to this domain will appear here."
            />
          )}
        </div>
      </Card>
    </div>
  );
}
