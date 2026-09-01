import { useState } from "react";
import { KeyRound, Mail, Save, ShieldCheck } from "lucide-react";
import { Card, CardHeader } from "../../components/ui/Card";
import Button from "../../components/ui/Button";
import Input from "../../components/ui/Input";
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

function Notice({ message }) {
  if (!message) return null;
  const isError = message.type === "error";
  return (
    <div
      className={`rounded-lg border px-3 py-2 text-[13px] ${
        isError ? "border-red-200 bg-red-50 text-red-700" : "border-emerald-200 bg-emerald-50 text-emerald-700"
      }`}
    >
      {message.text}
    </div>
  );
}

export default function AdminProfile() {
  const { user, updateEmail, changePassword } = useAuth();

  // Email
  const [email, setEmail] = useState(user?.email ?? "");
  const [emailMsg, setEmailMsg] = useState(null);
  const [emailSaving, setEmailSaving] = useState(false);

  // Password
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [pwdMsg, setPwdMsg] = useState(null);
  const [pwdSaving, setPwdSaving] = useState(false);

  async function handleEmailSubmit(event) {
    event.preventDefault();
    setEmailMsg(null);
    setEmailSaving(true);
    try {
      const data = await updateEmail(email);
      if (data?.user?.email) setEmail(data.user.email);
      setEmailMsg({ type: "success", text: "Email updated. Use the new email to log in next time." });
    } catch (err) {
      setEmailMsg({ type: "error", text: err?.message || "Could not update the email." });
    } finally {
      setEmailSaving(false);
    }
  }

  async function handlePasswordSubmit(event) {
    event.preventDefault();
    setPwdMsg(null);
    if (!currentPassword || !newPassword || !confirmPassword) {
      setPwdMsg({ type: "error", text: "Fill in all three password fields." });
      return;
    }
    if (newPassword.length < 6) {
      setPwdMsg({ type: "error", text: "New password must be at least 6 characters." });
      return;
    }
    if (newPassword !== confirmPassword) {
      setPwdMsg({ type: "error", text: "New password and confirmation do not match." });
      return;
    }
    setPwdSaving(true);
    try {
      await changePassword(currentPassword, newPassword);
      setPwdMsg({ type: "success", text: "Password updated. Use the new password next time you log in." });
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (err) {
      setPwdMsg({ type: "error", text: err?.message || "Could not change the password." });
    } finally {
      setPwdSaving(false);
    }
  }

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

      <Card>
        <CardHeader
          title="Update email"
          subtitle="Change the email address used to sign in. You can log in with the new email right away."
        />
        <form onSubmit={handleEmailSubmit} className="space-y-4">
          <Input
            label="New email"
            type="email"
            name="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <div className="flex items-center gap-3">
            <Button type="submit" icon={Save} loading={emailSaving} disabled={!email || email === user?.email}>
              Save email
            </Button>
            <Notice message={emailMsg} />
          </div>
        </form>
      </Card>

      <Card>
        <CardHeader title="Change password" subtitle="Set a new password for your account." />
        <form onSubmit={handlePasswordSubmit} className="space-y-4">
          <Input
            label="Current password"
            type="password"
            name="currentPassword"
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
          />
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Input
              label="New password"
              type="password"
              name="newPassword"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
            />
            <Input
              label="Confirm new password"
              type="password"
              name="confirmPassword"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
            />
          </div>
          <div className="flex items-center gap-3">
            <Button type="submit" icon={KeyRound} loading={pwdSaving}>
              Change password
            </Button>
            <Notice message={pwdMsg} />
          </div>
        </form>
      </Card>
    </div>
  );
}
