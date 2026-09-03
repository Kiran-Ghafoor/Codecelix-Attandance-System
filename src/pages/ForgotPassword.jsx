import { useState } from "react";
import { Link } from "react-router-dom";
import { Mail, ArrowLeft, MailCheck } from "lucide-react";
import Input from "../components/ui/Input";
import Button from "../components/ui/Button";
import { useAuth } from "../context/AuthContext";
import { ApiError } from "../lib/api";
import logo from "../assets/codecelix-logo.png";

// ---------------------------------------------------------------------------
// Forgot password — request a one-time password-reset link.
// Always shows the same confirmation message whether or not the account
// exists, so it can't be used to discover which emails are registered.
// ---------------------------------------------------------------------------

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [sent, setSent] = useState("");

  const { forgotPassword } = useAuth();

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setSent("");

    if (!email.trim()) {
      setError("Enter the email address associated with your account.");
      return;
    }

    setLoading(true);
    try {
      const data = await forgotPassword(email.trim().toLowerCase());
      setSent(data.message || "If an account exists for that email, a reset link has been sent.");
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message || "Failed to send reset link. Please try again.");
      } else {
        setError(err.message || "Failed to send reset link. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#f4f6f8] px-4">
      <div className="w-full max-w-sm">
        <div className="mb-8 flex flex-col items-center text-center">
          <img src={logo} alt="Attendance System" className="h-12 w-auto" />
          <p className="mt-3 text-[13px] text-steel-500">Internee Task &amp; Attendance System</p>
        </div>

        <div className="rounded-2xl border border-steel-200/60 bg-white p-6 shadow-card">
          {sent ? (
            <div className="space-y-4 text-center">
              <div className="rounded-xl bg-emerald-50 p-4">
                <MailCheck className="mx-auto mb-2 h-8 w-8 text-emerald-500" />
                <p className="text-[13px] font-medium text-steel-900">Check your inbox</p>
                <p className="mt-1 text-[12px] leading-relaxed text-steel-600">{sent}</p>
              </div>
              <Link
                to="/login"
                className="block w-full rounded-xl bg-steel-900 py-2.5 text-center text-[13px] font-medium text-white transition hover:bg-steel-800"
              >
                Back to login
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <h2 className="text-lg font-semibold text-steel-900">Forgot your password?</h2>
                <p className="mt-1 text-[13px] leading-relaxed text-steel-500">
                  Enter the email address you registered with and we&apos;ll send you a link to
                  reset your password.
                </p>
              </div>
              <Input
                label="Email"
                type="email"
                name="email"
                icon={Mail}
                placeholder="you@codecelix.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="username"
                error={error}
              />
              <Button type="submit" className="w-full" size="lg" loading={loading}>
                Send reset link
              </Button>
            </form>
          )}
        </div>

        <p className="mt-5 flex items-center justify-center gap-1 text-center text-[13px] text-steel-500">
          <ArrowLeft className="h-3.5 w-3.5" />
          Back to{" "}
          <Link to="/login" className="font-medium text-brand-600 hover:text-brand-700">
            Login
          </Link>
        </p>
      </div>
    </div>
  );
}
