import { useState, useEffect } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { Mail, Lock, ShieldCheck, GraduationCap, MailWarning } from "lucide-react";
import Input from "../components/ui/Input";
import Button from "../components/ui/Button";
import { useAuth, ROLE_ADMIN, ROLE_INTERNEE } from "../context/AuthContext";
import { ApiError } from "../lib/api";
import logo from "../assets/codecelix-logo.png";

// ---------------------------------------------------------------------------
// Login page — handles the email-not-verified denial state (via URL param
// from ProtectedRoute, or a backend 403 with code EMAIL_NOT_VERIFIED).
//
//   ?reason=unverified  — email not verified (verify email, then log in)
// ---------------------------------------------------------------------------

const DENIAL_CONFIG = {
  unverified: {
    icon: MailWarning,
    iconBg: "bg-amber-50",
    iconColor: "text-amber-500",
    title: "Email not verified",
    message: (email) =>
      `Please verify your email address before logging in. We sent a link to ${email}.`,
    showResend: true,
  },
};

export default function Login() {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialReason = searchParams.get("reason");
  const initialEmail = searchParams.get("email") || "";

  const [role, setRole] = useState(ROLE_INTERNEE);
  const [email, setEmail] = useState(initialEmail);
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Denial state (from URL params or backend error)
  const [denial, setDenial] = useState(initialReason || null);
  const [denialEmail, setDenialEmail] = useState(initialEmail);

  // Resend verification state
  const [resendLoading, setResendLoading] = useState(false);
  const [resendMsg, setResendMsg] = useState("");

  const { user, login, resendVerification } = useAuth();
  const navigate = useNavigate();

  // After login succeeds, navigate to the correct dashboard.
  useEffect(() => {
    if (user) {
      navigate(user.role === ROLE_ADMIN ? "/admin/dashboard" : "/internee/dashboard", { replace: true });
    }
  }, [user, navigate]);

  // Clear denial state when URL params change
  useEffect(() => {
    const r = searchParams.get("reason");
    const e = searchParams.get("email") || "";
    if (r) {
      setDenial(r);
      setDenialEmail(e);
      if (e && !email) setEmail(e);
    }
  }, [searchParams]); // eslint-disable-line react-hooks/exhaustive-deps

  function clearDenial() {
    setDenial(null);
    setDenialEmail("");
    setResendMsg("");
    setSearchParams({}, { replace: true });
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    clearDenial();

    if (!email || !password) {
      setError("Enter your email and password to continue.");
      return;
    }

    setLoading(true);
    try {
      await login(email.trim().toLowerCase(), password);
    } catch (err) {
      if (err instanceof ApiError) {
        switch (err.status) {
          case 401:
            setError(err.message || "Invalid email or password.");
            break;
          case 403: {
            // Backend returns { message, code } — only EMAIL_NOT_VERIFIED
            // applies in this flow (no admin approval step).
            if (err.code === "EMAIL_NOT_VERIFIED") {
              setDenial("unverified");
              setDenialEmail(email.trim().toLowerCase());
            } else {
              // Fallback: treat as unverified (safest default)
              setDenial("unverified");
              setDenialEmail(email.trim().toLowerCase());
            }
            break;
          }
          default:
            setError(err.message || "Login failed. Please try again.");
        }
      } else {
        setError(err.message || "Login failed. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  }

  async function handleResend() {
    setResendLoading(true);
    setResendMsg("");
    try {
      const data = await resendVerification(denialEmail.trim().toLowerCase());
      setResendMsg(data.message || "Verification email sent. Check your inbox.");
    } catch (err) {
      setResendMsg(err.message || "Failed to resend. Try again later.");
    } finally {
      setResendLoading(false);
    }
  }

  const denialConfig = denial ? DENIAL_CONFIG[denial] : null;

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#f4f6f8] px-4">
      <div className="w-full max-w-sm">
        <div className="mb-8 flex flex-col items-center text-center">
          <img src={logo} alt="Attendance System" className="h-12 w-auto" />
          <p className="mt-3 text-[13px] text-steel-500">Internee Task &amp; Attendance System</p>
        </div>

        <div className="rounded-2xl border border-steel-200/60 bg-white p-6 shadow-card">
          <div className="mb-5 grid grid-cols-2 gap-1 rounded-xl bg-steel-100/80 p-1">
            <button
              type="button"
              onClick={() => { setRole(ROLE_INTERNEE); clearDenial(); setError(""); }}
              className={`flex items-center justify-center gap-1.5 rounded-lg py-2 text-[13px] font-medium transition-all duration-150 ${
                role === ROLE_INTERNEE ? "bg-white text-steel-900 shadow-xs" : "text-steel-500 hover:text-steel-700"
              }`}
            >
              <GraduationCap className="h-4 w-4" /> Internee
            </button>
            <button
              type="button"
              onClick={() => { setRole(ROLE_ADMIN); clearDenial(); setError(""); }}
              className={`flex items-center justify-center gap-1.5 rounded-lg py-2 text-[13px] font-medium transition-all duration-150 ${
                role === ROLE_ADMIN ? "bg-white text-steel-900 shadow-xs" : "text-steel-500 hover:text-steel-700"
              }`}
            >
              <ShieldCheck className="h-4 w-4" /> Admin
            </button>
          </div>

          {denial && denialConfig ? (
            <div className="space-y-4">
              <div className={`rounded-xl p-4 text-center ${denialConfig.iconBg}`}>
                <denialConfig.icon className={`mx-auto mb-2 h-8 w-8 ${denialConfig.iconColor}`} />
                <p className="text-[13px] font-medium text-steel-900">{denialConfig.title}</p>
                <p className="mt-1 text-[12px] leading-relaxed text-steel-600">
                  {denialConfig.message(denialEmail)}
                </p>
              </div>

              {denialConfig.showResend && (
                <>
                  <Button
                    variant="secondary"
                    className="w-full"
                    size="md"
                    loading={resendLoading}
                    onClick={handleResend}
                  >
                    Resend verification email
                  </Button>

                  {resendMsg && (
                    <p className="rounded-lg bg-steel-50 px-3 py-2 text-center text-[12px] text-steel-600">
                      {resendMsg}
                    </p>
                  )}
                </>
              )}

              <button
                type="button"
                onClick={clearDenial}
                className="w-full text-center text-[13px] font-medium text-steel-500 hover:text-steel-700"
              >
                Use a different email
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <Input
                label="Email"
                type="email"
                name="email"
                icon={Mail}
                placeholder="you@codecelix.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="username"
              />
              <Input
                label="Password"
                type="password"
                name="password"
                icon={Lock}
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="current-password"
                error={error}
              />
              <div className="flex justify-end">
                <Link
                  to="/forgot-password"
                  className="text-[12px] font-medium text-brand-600 hover:text-brand-700"
                >
                  Forgot password?
                </Link>
              </div>
              <Button type="submit" className="w-full" size="lg" loading={loading}>
                Log in as {role === ROLE_ADMIN ? "Admin" : "Internee"}
              </Button>
            </form>
          )}
        </div>

        <p className="mt-5 text-center text-[13px] text-steel-500">
          Don&apos;t have an account?{" "}
          <Link to="/register" className="font-medium text-brand-600 hover:text-brand-700">
            Register
          </Link>
        </p>
      </div>
    </div>
  );
}
