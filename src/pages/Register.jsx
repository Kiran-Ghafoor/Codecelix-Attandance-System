import { useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { User, Mail, Lock, Phone, CreditCard, ArrowLeft, CheckCircle2, MailCheck } from "lucide-react";
import Input from "../components/ui/Input";
import Select from "../components/ui/Select";
import Button from "../components/ui/Button";
import { useAuth } from "../context/AuthContext";
import { useBatches } from "../context/BatchesContext";
import { CNIC_REGEX, PHONE_REGEX } from "../lib/registration";
import { ApiError } from "../lib/api";
import logo from "../assets/codecelix-logo.png";

const INITIAL_FORM = {
  name: "",
  email: "",
  password: "",
  cnic: "",
  phone: "",
  batchId: "",
  domain: "",
};

function validate(form) {
  const errors = {};

  if (!form.name.trim()) errors.name = "Full name is required.";
  else if (form.name.trim().length < 2) errors.name = "Name must be at least 2 characters.";
  else if (form.name.trim().length > 100) errors.name = "Name must be at most 100 characters.";

  if (!form.email.trim()) errors.email = "Email is required.";
  else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) errors.email = "Enter a valid email address.";

  if (!form.password) errors.password = "Password is required.";
  else if (form.password.length < 6) errors.password = "Password must be at least 6 characters.";
  else if (form.password.length > 128) errors.password = "Password must be at most 128 characters.";

  if (!form.cnic.trim()) errors.cnic = "CNIC is required.";
  else if (!CNIC_REGEX.test(form.cnic.trim())) errors.cnic = "Format: 12345-1234567-1";

  if (!form.phone.trim()) errors.phone = "Contact number is required.";
  else {
    const digits = form.phone.replace(/[\s\-()]/g, "");
    if (!PHONE_REGEX.test(digits)) errors.phone = "Format: 03XXXXXXXXX or +92 3XXXXXXXXX";
  }

  if (!form.batchId) errors.batchId = "Select a batch.";

  if (!form.domain) errors.domain = "Domain is required.";

  return errors;
}

export default function Register() {
  const [form, setForm] = useState(INITIAL_FORM);
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [registeredEmail, setRegisteredEmail] = useState("");
  const { register } = useAuth();
  const { activeBatches } = useBatches();
  const navigate = useNavigate();

  const selectedBatch = useMemo(
    () => activeBatches.find((b) => b.id === form.batchId) ?? null,
    [activeBatches, form.batchId]
  );

  const batchOptions = useMemo(
    () => [
      { value: "", label: "Select a batch" },
      ...activeBatches.map((b) => ({ value: b.id, label: `${b.batchCode} — Batch ${b.batchNumber}` })),
    ],
    [activeBatches]
  );

  const domainOptions = useMemo(() => {
    if (!selectedBatch) return [{ value: "", label: "Select a domain" }];
    const unique = [...new Set(selectedBatch.domains.map((d) => d.name))];
    return [
      { value: "", label: "Select a domain" },
      ...unique.map((name) => ({ value: name, label: name })),
    ];
  }, [selectedBatch]);

  function handleChange(e) {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: "" }));
    if (name === "batchId") {
      setForm((prev) => ({ ...prev, batchId: value, domain: "" }));
      if (errors.domain) setErrors((prev) => ({ ...prev, domain: "" }));
    }
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setServerError("");

    const validationErrors = validate(form);
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setLoading(true);
    try {
      const batch = activeBatches.find((b) => b.id === form.batchId);
      await register({
        name: form.name.trim(),
        email: form.email.trim().toLowerCase(),
        password: form.password,
        cnic: form.cnic.trim(),
        phone: form.phone.trim(),
        batchCode: batch.batchCode,
        batchId: batch.id,
        domain: form.domain,
      });
      setRegisteredEmail(form.email.trim().toLowerCase());
      setSuccess(true);
    } catch (err) {
      if (err instanceof ApiError && err.status === 409) {
        setServerError(err.message || "An account with this email or CNIC already exists.");
      } else {
        setServerError(err.message || "Registration failed. Please try again.");
      }
      // Clear password on any error for security
      setForm((prev) => ({ ...prev, password: "" }));
    } finally {
      setLoading(false);
    }
  }

  if (success) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#f4f6f8] px-4">
        <div className="w-full max-w-sm text-center">
          <div className="mb-8 flex flex-col items-center">
            <img src={logo} alt="CodeCelix" className="h-12 w-auto" />
          </div>
          <div className="rounded-2xl border border-steel-200/60 bg-white p-8 shadow-card">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-brand-50">
              <MailCheck className="h-7 w-7 text-brand-600" />
            </div>
            <h2 className="font-display text-[17px] font-bold text-steel-900">Check your email</h2>
            <p className="mt-2 text-[13px] leading-relaxed text-steel-500">
              We sent a verification link to{" "}
              <span className="font-medium text-steel-700">{registeredEmail}</span>.
              Click the link in the email to verify your account before logging in.
            </p>
            <p className="mt-2 text-[12px] text-steel-400">
              The link expires in 24 hours. Check your spam folder if you don&apos;t see it.
            </p>
            <Button className="mt-6 w-full" size="lg" onClick={() => navigate("/login", { replace: true })}>
              Go to login
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#f4f6f8] px-4 py-8">
      <div className="w-full max-w-sm">
        <div className="mb-6 flex flex-col items-center text-center">
          <img src={logo} alt="CodeCelix" className="h-12 w-auto" />
          <p className="mt-3 text-[13px] text-steel-500">Create your internee account</p>
        </div>

        <div className="rounded-2xl border border-steel-200/60 bg-white p-6 shadow-card">
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="Full Name"
              name="name"
              icon={User}
              placeholder="e.g. Ali Raza"
              value={form.name}
              onChange={handleChange}
              error={errors.name}
              autoComplete="name"
            />
            <Input
              label="Email"
              type="email"
              name="email"
              icon={Mail}
              placeholder="you@example.com"
              value={form.email}
              onChange={handleChange}
              error={errors.email}
              autoComplete="email"
            />
            <Input
              label="Password"
              type="password"
              name="password"
              icon={Lock}
              placeholder="At least 6 characters"
              value={form.password}
              onChange={handleChange}
              error={errors.password}
              autoComplete="new-password"
            />
            <Input
              label="CNIC"
              name="cnic"
              icon={CreditCard}
              placeholder="12345-1234567-1"
              value={form.cnic}
              onChange={handleChange}
              error={errors.cnic}
            />
            <Input
              label="Contact Number"
              name="phone"
              icon={Phone}
              placeholder="+92 300 1234567"
              value={form.phone}
              onChange={handleChange}
              error={errors.phone}
              autoComplete="tel"
            />
            <Select
              label="Batch"
              name="batchId"
              options={batchOptions}
              value={form.batchId}
              onChange={handleChange}
              error={errors.batchId}
            />
            <Select
              label="Domain"
              name="domain"
              options={domainOptions}
              value={form.domain}
              onChange={handleChange}
              error={errors.domain}
              disabled={!form.batchId}
            />

            {serverError && (
              <p className="rounded-lg bg-red-50 px-3 py-2 text-[13px] text-red-600">{serverError}</p>
            )}

            <Button type="submit" className="w-full" size="lg" loading={loading}>
              Register
            </Button>
          </form>

          <div className="mt-5 border-t border-steel-100 pt-4 text-center">
            <Link
              to="/login"
              className="inline-flex items-center gap-1.5 text-[13px] font-medium text-steel-500 hover:text-steel-700"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              Already have an account? Log in
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
