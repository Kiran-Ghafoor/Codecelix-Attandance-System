import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { Lock, CheckCircle2, AlertCircle, ArrowLeft } from "lucide-react";
import Input from "../components/ui/Input";
import Button from "../components/ui/Button";
import { useAuth } from "../context/AuthContext";
import { ApiError } from "../lib/api";
import logo from "../assets/codecelix-logo.png";

// ---------------------------------------------------------------------------
// Reset password — consumes the one-time token from the emailed link
// (`?token=...`) and sets a new password. The token can only be used once.
//
//   /reset-password?token=<one-time-token>
// ---------------------------------------------------------------------------

export default function ResetPassword() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token") || "";

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [done, setDone] = useState(false);

  const { resetPassword } = useAuth();

  // If the link arrived without a token, show an invalid-state notice.
  useEffect(() => {
    if (!token) {
      setError("This password reset link is invalid or incomplete. Please request a new one.");
    }
  }, [token]);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");

    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }
    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);
    try {
      await resetPassword(token, password);
      setDone(true);
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message || "Unable to reset password. Please request a new link.");
      } else {
        setError(err.message || "Unable to reset password. Please request a new link.");
      }
    } finally {
      setLoading(false);
    }
  }

  if (done) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#f4f6f8] px-4">
        <div className="w-full max-w-sm rounded-2xl border border-steel-200/60 bg-white p-6 text-center shadow-card">
          <div className="rounded-xl bg-emerald-50 p-4">
            <CheckCircle2 className="mx-auto mb-2 h-8 w-8 text-emerald-500" />
            <p className="text-[13px] font-medium text-steel-900">Password updated</p>
            <p className="mt-1 text-[12px] leading-relaxed text-steel-600">
              Your password has been reset. You can now log in with it.
            </p>
          </div>
          <Link
            to="/login"
            className="mt-4 block w-full rounded-xl bg-steel-900 py-2.5 text-center text-[13px] font-medium text-white transition hover:bg-steel-800"
          >
            Go to login
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#f4f6f8] px-4">
      <div className="w-full max-w-sm">
        <div className="mb-8 flex flex-col items-center text-center">
          <img src={logo} alt="Attendance System" className="h-12 w-auto" />
          <p className="mt-3 text-[13px] text-steel-500">Internee Task &amp; Attendance System</p>
        </div>

        <div className="rounded-2xl border border-steel-200/60 bg-white p-6 shadow-card">
          {!token ? (
            <div className="space-y-4 text-center">
              <div className="rounded-xl bg-red-50 p-4">
                <AlertCircle className="mx-auto mb-2 h-8 w-8 text-red-500" />
                <p className="text-[13px] font-medium text-steel-900">Invalid reset link</p>
                <p className="mt-1 text-[12px] leading-relaxed text-steel-600">{error}</p>
              </div>
              <Link
                to="/forgot-password"
                className="block w-full rounded-xl bg-steel-900 py-2.5 text-center text-[13px] font-medium text-white transition hover:bg-steel-800"
              >
                Request a new link
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <h2 className="text-lg font-semibold text-steel-900">Set a new password</h2>
                <p className="mt-1 text-[13px] leading-relaxed text-steel-500">
                  Choose a strong password. Your old password will no longer work.
                </p>
              </div>
              <Input
                label="New password"
                type="password"
                name="password"
                icon={Lock}
                placeholder="At least 6 characters"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="new-password"
              />
              <Input
                label="Confirm new password"
                type="password"
                name="confirmPassword"
                icon={Lock}
                placeholder="Repeat your new password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                autoComplete="new-password"
                error={error}
              />
              <Button type="submit" className="w-full" size="lg" loading={loading}>
                Reset password
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
