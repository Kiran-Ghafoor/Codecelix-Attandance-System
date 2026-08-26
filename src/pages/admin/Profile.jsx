import { Mail, ShieldCheck } from "lucide-react";
import { Card, CardHeader } from "../../components/ui/Card";
import { useAuth } from "../../context/AuthContext";

function Field({ icon: Icon, label, value }) {
  return (
    <div className="flex items-start gap-3 rounded-xl border border-steel-100 bg-steel-50/50 px-4 py-3">
      <Icon className="mt-0.5 h-4 w-4 text-steel-400" />
      <div>
        <p className="text-[11px] font-semibold uppercase tracking-wider text-steel-400">{label}</p>
        <p className="mt-0.5 text-[13px] text-steel-800">{value}</p>
      </div>
    </div>
  );
}

export default function AdminProfile() {
  const { user } = useAuth();

  return (
    <div className="mx-auto max-w-2xl space-y-5">
      <Card>
        <div className="flex items-center gap-4">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-brand-600 text-lg font-bold tracking-wide text-white">
            {user?.avatarInitials}
          </div>
          <div>
            <h2 className="font-display text-lg font-bold text-steel-900">{user?.name}</h2>
            <p className="text-[13px] text-steel-500">{user?.title}</p>
          </div>
        </div>
      </Card>

      <Card>
        <CardHeader title="Details" />
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <Field icon={Mail} label="Email" value={user?.email} />
          <Field icon={ShieldCheck} label="Role" value="Administrator" />
        </div>
      </Card>
    </div>
  );
}
