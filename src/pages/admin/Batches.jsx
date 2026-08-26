import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { CalendarRange, Layers, Plus, Users } from "lucide-react";
import { Card, CardHeader } from "../../components/ui/Card";
import { Table, THead, TRow, TCell } from "../../components/ui/Table";
import Badge from "../../components/ui/Badge";
import Button from "../../components/ui/Button";
import EmptyState from "../../components/ui/EmptyState";
import BatchFormModal from "../../components/batches/BatchFormModal";
import { useBatches } from "../../context/BatchesContext";
import { useInternees } from "../../context/InterneesContext";
import { countBatchInternees } from "../../lib/mockData";
import { formatDate } from "../../lib/format";

export default function Batches() {
  const { batches, createBatch, isDuplicateCode } = useBatches();
  const { internees: roster } = useInternees();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <p className="text-[13px] text-steel-500">{batches.length} batches on record</p>
        <Button icon={Plus} onClick={() => setOpen(true)}>
          New Batch
        </Button>
      </div>

      <Card padded={false}>
        <div className="px-5 pt-5 pb-0 sm:px-6">
          <CardHeader title="All batches" subtitle="Each batch is organised into domains led by a team leader" />
        </div>
        <div className="p-5 pt-0 sm:p-6 sm:pt-0">
          {batches.length > 0 ? (
            <Table>
              <THead columns={["Batch Code", "Batch", "Program", "Dates", "Domains", "Internees", "Status"]} />
              <tbody>
                {batches.map((batch) => (
                  <TRow key={batch.id} className="cursor-pointer" onClick={() => navigate(`/admin/batches/${batch.id}`)}>
                    <TCell>
                      <span className="font-display text-[13px] font-bold text-steel-800">{batch.batchCode}</span>
                    </TCell>
                    <TCell>
                      <Link
                        to={`/admin/batches/${batch.id}`}
                        onClick={(e) => e.stopPropagation()}
                        className="font-medium text-steel-800 hover:text-brand-700"
                      >
                        Batch {batch.batchNumber}
                      </Link>
                    </TCell>
                    <TCell>
                      <span className="text-steel-600">{batch.program}</span>
                    </TCell>
                    <TCell>
                      <span className="inline-flex items-center gap-1.5 text-steel-600">
                        <CalendarRange className="h-3.5 w-3.5 text-steel-400" />
                        {formatDate(batch.startDate)} — {formatDate(batch.endDate)}
                      </span>
                    </TCell>
                    <TCell>
                      <span className="inline-flex items-center gap-1.5 text-steel-600">
                        <Layers className="h-3.5 w-3.5 text-steel-400" /> {batch.domains?.length ?? 0}
                      </span>
                    </TCell>
                    <TCell>
                      <span className="inline-flex items-center gap-1.5 text-steel-600">
                        <Users className="h-3.5 w-3.5 text-steel-400" /> {countBatchInternees(batch, roster)}
                      </span>
                    </TCell>
                    <TCell>
                      <Badge status={batch.status.toLowerCase()} />
                    </TCell>
                  </TRow>
                ))}
              </tbody>
            </Table>
          ) : (
            <EmptyState
              icon={Layers}
              title="No batches yet"
              description="Create your first batch to start organizing internees into domains."
              action={
                <Button icon={Plus} onClick={() => setOpen(true)}>
                  New Batch
                </Button>
              }
            />
          )}
        </div>
      </Card>

      <BatchFormModal
        open={open}
        onClose={() => setOpen(false)}
        title="Create batch"
        onSubmit={(payload) => createBatch(payload)}
        isDuplicateCode={isDuplicateCode}
      />
    </div>
  );
}
