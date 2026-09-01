import { useState } from "react";
import { UserPlus } from "lucide-react";
import Modal from "../ui/Modal";
import Input from "../ui/Input";
import Select from "../ui/Select";
import Button from "../ui/Button";
import { apiRequest } from "../../lib/api";

const CNIC_PATTERN = /^\d{5}-\d{7}-\d$/;
const PHONE_PATTERN = /^(\+92|0)3[0-9]{9}$/;

// Admin-only "Add internee" — creates a pre-approved internee directly (no
// self-registration), and can also restore a previously REMOVED internee by
// re-using their email.
export default function AddInterneeModal({ open, onClose, batches, onAdded }) {
  const [form, setForm] = useState({ name: "", email: "", password: "", cnic: "", phone: "", batchId: "", domainId: "" });
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);
  const [serverError, setServerError] = useState("");

  const selectedBatch = batches.find((b) => b.id === form.batchId) ?? null;
  const domainOptions = [
    { value: "", label: selectedBatch ? "Select domain…" : "Choose a batch first" },
    ...(selectedBatch?.domains ?? []).map((d) => ({ value: d.id, label: d.name })),
  ];
  const batchOptions = [
    { value: "", label: "Select batch…" },
    ...batches.filter((b) => b.status === "Active").map((b) => ({ value: b.id, label: b.batchCode })),
  ];

  function setField(key, value) {
    setForm((f) => ({ ...f, [key]: value }));
    if (key === "batchId") setForm((f) => ({ ...f, domainId: "" }));
    setErrors((e) => ({ ...e, [key]: undefined }));
  }

  function validate() {
    const next = {};
    if (form.name.trim().length < 2) next.name = "Full name is required.";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) next.email = "Enter a valid email address.";
    if (form.password.length < 6) next.password = "Password must be at least 6 characters.";
    if (!CNIC_PATTERN.test(form.cnic.trim())) next.cnic = "Format: 12345-1234567-1";
    if (form.phone && !PHONE_PATTERN.test(form.phone.replace(/[\s\-()]/g, ""))) {
      next.phone = "Enter a valid Pakistani mobile number.";
    }
    if (!form.batchId) next.batchId = "Select a batch.";
    if (!form.domainId) next.domainId = "Select a domain.";
    return next;
  }

  async function handleSubmit() {
    const next = validate();
    setErrors(next);
    if (Object.keys(next).length > 0) return;
    setSaving(true);
    setServerError("");
    try {
      await apiRequest("/internees", {
        method: "POST",
        body: {
          name: form.name.trim(),
          email: form.email.trim(),
          password: form.password,
          cnic: form.cnic.trim() || undefined,
          phone: form.phone.trim() || undefined,
          batchId: form.batchId,
          domainId: form.domainId,
        },
      });
      setForm({ name: "", email: "", password: "", cnic: "", phone: "", batchId: "", domainId: "" });
      onAdded?.();
      onClose();
    } catch (err) {
      setServerError(err?.message || "Could not add the internee.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <Modal
      open={open}
      onClose={() => !saving && onClose()}
      title="Add internee manually"
      size="lg"
      footer={
        <>
          <Button variant="secondary" onClick={onClose} disabled={saving}>
            Cancel
          </Button>
          <Button icon={UserPlus} loading={saving} onClick={handleSubmit}>
            Add internee
          </Button>
        </>
      }
    >
      <div className="space-y-4">
        <p className="text-[13px] text-steel-500">
          Creates a pre-approved internee who can log in immediately. Adding someone with the email of a previously
          removed internee restores that account.
        </p>

        <Input
          label="Full name"
          name="add-name"
          value={form.name}
          onChange={(e) => setField("name", e.target.value)}
          error={errors.name}
        />
        <Input
          label="Email"
          name="add-email"
          type="email"
          value={form.email}
          onChange={(e) => setField("email", e.target.value)}
          error={errors.email}
        />
        <Input
          required
          label="Temporary password"
          name="add-password"
          type="text"
          value={form.password}
          onChange={(e) => setField("password", e.target.value)}
          error={errors.password}
        />

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Input
            required
            label="CNIC"
            name="add-cnic"
            placeholder="12345-1234567-1"
            value={form.cnic}
            onChange={(e) => setField("cnic", e.target.value)}
            error={errors.cnic}
          />
          <Input
            label="Phone (optional)"
            name="add-phone"
            placeholder="03XXXXXXXXX"
            value={form.phone}
            onChange={(e) => setField("phone", e.target.value)}
            error={errors.phone}
          />
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Select
            label="Batch"
            aria-label="Batch"
            options={batchOptions}
            value={form.batchId}
            onChange={(e) => setField("batchId", e.target.value)}
            error={errors.batchId}
          />
          <Select
            label="Domain"
            aria-label="Domain"
            options={domainOptions}
            value={form.domainId}
            disabled={!selectedBatch}
            onChange={(e) => setField("domainId", e.target.value)}
            error={errors.domainId}
          />
        </div>

        {serverError && (
          <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-[13px] text-red-700">{serverError}</p>
        )}
      </div>
    </Modal>
  );
}
