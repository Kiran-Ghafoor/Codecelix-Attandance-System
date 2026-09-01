import { useEffect, useState } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { CheckCircle2, XCircle, Loader2, Mail, ArrowLeft } from "lucide-react";
import Button from "../components/ui/Button";
import Input from "../components/ui/Input";
import { useAuth } from "../context/AuthContext";
import logo from "../assets/codecelix-logo.png";

export default function VerifyEmail() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");

  const [status, setStatus] = useState("verifying"); // verifying | success | error
  const [errorMsg, setErrorMsg] = useState("");
  const [resendEmail, setResendEmail] = useState("");
  const [resendLoading, setResendLoading] = useState(false);
  const [resendMsg, setResendMsg] = useState("");
  const { verifyEmail, resendVerification } = useAuth();

  useEffect(() => {
    if (!token) {
      setStatus("error");
      setErrorMsg("No verification token provided. Please use the link from your email.");
      return;
    }

    let cancelled = false;

    async function run() {
      try {
        await verifyEmail(token);
        if (!cancelled) setStatus("success");
      } catch (err) {
        if (!cancelled) {
          setStatus("error");
          setErrorMsg(err.message || "Verification failed. The link may have expired or already been used.");
        }
      }
    }

    run();
    return () => { cancelled = true; };
  }, [token, verifyEmail]);

  async function handleResend(e) {
    e.preventDefault();
    setResendMsg("");

    if (!resendEmail.trim()) {
      setResendMsg("Enter your email address.");
      return;
    }

    setResendLoading(true);
    try {
      const data = await resendVerification(resendEmail.trim().toLowerCase());
      setResendMsg(data.message || "Verification email sent. Check your inbox.");
    } catch (err) {
      setResendMsg(err.message || "Failed to resend. Try again later.");
    } finally {
      setResendLoading(false);
    }
  }

  // ── Loading spinner while verifying ────────────────────────────────────
  if (status === "verifying") {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#f4f6f8] px-4">
        <div className="w-full max-w-sm text-center">
          <div className="mb-8 flex flex-col items-center">
            <img src={logo} alt="Attendance System" className="h-12 w-auto" />
          </div>
          <div className="rounded-2xl border border-steel-200/60 bg-white p-8 shadow-card">
            <Loader2 className="mx-auto h-8 w-8 animate-spin text-brand-600" />
            <p className="mt-4 text-[13px] text-steel-500">Verifying your email...</p>
          </div>
        </div>
      </div>
    );
  }

  // ── Success state ──────────────────────────────────────────────────────
  if (status === "success") {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#f4f6f8] px-4">
        <div className="w-full max-w-sm text-center">
          <div className="mb-8 flex flex-col items-center">
            <img src={logo} alt="Attendance System" className="h-12 w-auto" />
          </div>
          <div className="rounded-2xl border border-steel-200/60 bg-white p-8 shadow-card">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-green-50">
              <CheckCircle2 className="h-7 w-7 text-green-600" />
            </div>
            <h2 className="font-display text-[17px] font-bold text-steel-900">Email verified</h2>
            <p className="mt-2 text-[13px] leading-relaxed text-steel-500">
              Your email has been verified successfully. You can now log in to your account.
            </p>
            <Button className="mt-6 w-full" size="lg" onClick={() => (window.location.href = "/login")}>
              Go to login
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // ── Error state ────────────────────────────────────────────────────────
  return (
    <div className="flex min-h-screen items-center justify-center bg-[#f4f6f8] px-4">
      <div className="w-full max-w-sm">
        <div className="mb-8 flex flex-col items-center text-center">
          <img src={logo} alt="Attendance System" className="h-12 w-auto" />
        </div>

        <div className="rounded-2xl border border-steel-200/60 bg-white p-8 shadow-card">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-red-50">
            <XCircle className="h-7 w-7 text-red-500" />
          </div>
          <h2 className="font-display text-[17px] font-bold text-steel-900">Verification failed</h2>
          <p className="mt-2 text-[13px] leading-relaxed text-steel-500">{errorMsg}</p>
          <p className="mt-2 text-[12px] text-steel-400">
            Verification links expire after 24 hours. If your link has expired, request a new one below.
          </p>

          <div className="mt-6 border-t border-steel-100 pt-5">
            <p className="mb-3 text-[12px] font-medium uppercase tracking-wide text-steel-400">
              Resend verification email
            </p>
            <form onSubmit={handleResend} className="space-y-3">
              <Input
                type="email"
                name="resendEmail"
                icon={Mail}
                placeholder="you@example.com"
                value={resendEmail}
                onChange={(e) => { setResendEmail(e.target.value); setResendMsg(""); }}
              />
              <Button type="submit" className="w-full" size="md" loading={resendLoading}>
                Resend link
              </Button>
            </form>
            {resendMsg && (
              <p className="mt-3 rounded-lg bg-steel-50 px-3 py-2 text-[12px] text-steel-600">{resendMsg}</p>
            )}
          </div>
        </div>

        <p className="mt-5 text-center">
          <Link
            to="/login"
            className="inline-flex items-center gap-1.5 text-[13px] font-medium text-steel-500 hover:text-steel-700"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            Back to login
          </Link>
        </p>
      </div>
    </div>
  );
}
