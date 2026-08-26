import { useState } from "react";
import Modal from "../ui/Modal";
import Input from "../ui/Input";
import Select from "../ui/Select";
import Button from "../ui/Button";
import { getPhoneError } from "../../lib/phone";

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Accepts 35202-1234567-1 or the bare 13 digits; stores the dashed form.
function normalizeCnic(value) {
  const raw = value.replace(/[\s-]/g, "");
  if (!/^\d{13}$/.test(raw)) return null;
  return `${raw.slice(0, 5)}-${raw.slice(5, 12)}-${raw.slice(12)}`;
}

function validate({ name, email, phone, cnic, batchId, domainId }, roster) {
  const errors = {};
  if (name.trim().length < 2) errors.name = "Enter the internee's full name.";

  const normalizedEmail = email.trim().toLowerCase();
  if (!EMAIL_PATTERN.test(normalizedEmail)) {
    errors.email = "Enter a valid email address.";
  } else if (roster.some((i) => i.email.toLowerCase() === normalizedEmail)) {
    errors.email = "An internee with this email already exists.";
  }

  const trimmedPhone = phone.trim();
  const phoneProblem = getPhoneError(trimmedPhone);
  if (phoneProblem) errors.phone = phoneProblem;

  const normalizedCnic = normalizeCnic(cnic);
  if (!cnic.trim()) errors.cnic = "CNIC is required.";
  else if (!normalizedCnic) errors.cnic = "CNIC must be 13 digits (XXXXX-XXXXXXX-X).";
  else if (roster.some((i) => i.cnic === normalizedCnic)) errors.cnic = "An internee with this CNIC already exists.";

  if (!batchId) errors.batchId = "Choose a batch.";
  if (!domainId) errors.domainId = batchId ? "Choose a domain." : "Choose a batch first.";
  return errors;
}

// Admin-only manual internee onboarding: identity + contact details with an
// explicit batch and domain assignment (domains cascade from the chosen
// batch). Reachable solely from admin pages under the /admin protected routes.
// When `fixedBatchId` is given (Add from a batch's details page), the batch is
// pre-selected and locked.
export default function InterneeFormModal({ open, onClose, batches, roster, onSubmit, fixedBatchId = "" }) {
  // Keyed remount keeps the form fresh for every open, mirroring BatchFormModal.
  return (
    <Modal open={open} onClose={onClose} title="Add internee">
      {open && (
        <InterneeForm
          key={`${roster.length}-${fixedBatchId}`}
          batches={batches}
          roster={roster}
          onClose={onClose}
          onSubmit={onSubmit}
          fixedBatchId={fixedBatchId}
        />
      )}
    </Modal>
  );
}

function InterneeForm({ batches, roster, onClose, onSubmit, fixedBatchId }) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [cnic, setCnic] = useState("");
  const [batchId, setBatchId] = useState(fixedBatchId || "");
  const [domainId, setDomainId] = useState("");
  const [errors, setErrors] = useState({});

  const activeBatches = batches.filter((b) => b.status !== "Completed");
  const selectedBatch = activeBatches.find((b) => b.id === batchId);
  const domainOptions = (selectedBatch?.domains ?? []).map((d) => ({ value: d.id, label: d.name }));

  function clearError(field) {
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: undefined }));
  }

  function handleBatchChange(event) {
    setBatchId(event.target.value);
    setDomainId("");
    if (errors.batchId || errors.domainId) setErrors((prev) => ({ ...prev, batchId: undefined, domainId: undefined }));
  }

  function handleSubmit(event) {
    event.preventDefault();
    const nextErrors = validate({ name, email, phone, cnic, batchId, domainId }, roster);
    if (Object.values(nextErrors).some(Boolean)) {
      setErrors(nextErrors);
      return;
    }
    onSubmit({
      name: name.trim(),
      email: email.trim(),
      phone: phone.trim(),
      cnic: normalizeCnic(cnic),
      batchId,
      domainId,
    });
    onClose();
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5" noValidate>
      <Input
        label="Full name"
        name="interneeName"
        placeholder="e.g. Ahmed Raza"
        value={name}
        error={errors.name}
        onChange={(e) => {
          setName(e.target.value);
          clearError("name");
        }}
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Input
          label="Email"
          name="interneeEmail"
          type="email"
          placeholder="e.g. ahmed.raza@codecelix.com"
          value={email}
          error={errors.email}
          onChange={(e) => {
            setEmail(e.target.value);
            clearError("email");
          }}
        />
        <Input
          label="Phone number"
          name="interneePhone"
          type="tel"
          placeholder="e.g. 0300 1234567"
          value={phone}
          error={errors.phone}
          onChange={(e) => {
            setPhone(e.target.value);
            clearError("phone");
          }}
        />
      </div>

      <Input
        label="CNIC"
        name="interneeCnic"
        placeholder="e.g. 35202-1234567-1"
        value={cnic}
        error={errors.cnic}
        onChange={(e) => {
          setCnic(e.target.value);
          clearError("cnic");
        }}
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {/* Assignment is explicit: pick the batch, then one of ITS domains.
            Locked when opened from a batch's details page. */}
        <Select
          label="Batch number"
          name="interneeBatch"
          options={[{ value: "", label: "Select batch" }, ...activeBatches.map((b) => ({ value: b.id, label: b.name }))]}
          value={batchId}
          error={errors.batchId}
          disabled={Boolean(fixedBatchId)}
          onChange={handleBatchChange}
        />
        <Select
          label="Domain"
          name="interneeDomain"
          options={[
            { value: "", label: selectedBatch ? "Select domain" : "Select batch first" },
            ...domainOptions,
          ]}
          value={domainId}
          error={errors.domainId}
          disabled={!selectedBatch}
          onChange={(e) => {
            setDomainId(e.target.value);
            clearError("domainId");
          }}
        />
      </div>

      <div className="flex justify-end gap-2 border-t border-steel-100 pt-4">
        <Button type="button" variant="secondary" onClick={onClose}>
          Cancel
        </Button>
        <Button type="submit">Add internee</Button>
      </div>
      <p className="text-[12px] text-steel-400">
        The internee is placed into the selected batch and domain. UI mock — kept in memory for this session only.
      </p>
    </form>
  );
}
