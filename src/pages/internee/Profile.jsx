import { Mail, Phone, Layers, CalendarDays, Shapes } from "lucide-react";
import { Card, CardHeader } from "../../components/ui/Card";
import { useAuth } from "../../context/AuthContext";
import { useBatches } from "../../context/BatchesContext";

function Field({ icon: Icon, label, value }) {
  return (
    <div className="flex items-start gap-3 rounded-lg border border-steel-100 bg-steel-50/50 px-4 py-3">
      <Icon className="mt-0.5 h-4 w-4 text-steel-400" />
      <div>
        <p className="text-xs font-medium uppercase tracking-wide text-steel-400">{label}</p>
        <p className="mt-0.5 text-sm text-steel-800">{value || "—"}</p>
      </div>
    </div>
  );
}

export default function Profile() {
  const { user } = useAuth();
  const { batches } = useBatches();
  const batchCode = user?.batchId ? batches.find((b) => b.id === user.batchId)?.batchCode : null;

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <Card>
        <div className="flex items-center gap-4">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-brand-600 text-xl font-semibold text-white">
            {user?.avatarInitials}
          </div>
          <div>
            <h2 className="font-display text-lg font-semibold text-steel-900">{user?.name}</h2>
            <p className="text-sm text-steel-500">{batchCode ?? "Unassigned batch"}</p>
          </div>
        </div>
      </Card>

      <Card>
        <CardHeader title="Details" subtitle="Read-only for now — contact admin to update" />
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <Field icon={Mail} label="Email" value={user?.email} />
          <Field icon={Phone} label="Phone" value={user?.phone} />
          <Field icon={Layers} label="Batch" value={batchCode} />
          <Field icon={Shapes} label="Domain" value={user?.domainName} />
          <Field icon={CalendarDays} label="Joined" value={user?.joinDate} />
        </div>
      </Card>
    </div>
  );
}
