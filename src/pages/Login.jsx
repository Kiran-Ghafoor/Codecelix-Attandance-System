import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Mail, Lock, ShieldCheck, GraduationCap } from "lucide-react";
import Input from "../components/ui/Input";
import Button from "../components/ui/Button";
import { useAuth, ROLE_ADMIN, ROLE_INTERNEE } from "../context/AuthContext";
import logo from "../assets/codecelix-logo.png";

export default function Login() {
  const [role, setRole] = useState(ROLE_INTERNEE);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const { user, login } = useAuth();
  const navigate = useNavigate();

  // After login succeeds, user is set in context — navigate to the
  // correct dashboard based on the actual user role (backend-authoritative).
  useEffect(() => {
    if (user) {
      navigate(user.role === ROLE_ADMIN ? "/admin/dashboard" : "/internee/dashboard", { replace: true });
    }
  }, [user, navigate]);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");

    if (!email || !password) {
      setError("Enter your email and password to continue.");
      return;
    }

    setLoading(true);
    try {
      await login(email, password);
    } catch (err) {
      setError(err.message || "Login failed. Please check your credentials.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#f4f6f8] px-4">
      <div className="w-full max-w-sm">
        <div className="mb-8 flex flex-col items-center text-center">
          <img src={logo} alt="CodeCelix" className="h-12 w-auto" />
          <p className="mt-3 text-[13px] text-steel-500">Internee Task &amp; Attendance System</p>
        </div>

        <div className="rounded-2xl border border-steel-200/60 bg-white p-6 shadow-card">
          <div className="mb-5 grid grid-cols-2 gap-1 rounded-xl bg-steel-100/80 p-1">
            <button
              type="button"
              onClick={() => setRole(ROLE_INTERNEE)}
              className={`flex items-center justify-center gap-1.5 rounded-lg py-2 text-[13px] font-medium transition-all duration-150 ${
                role === ROLE_INTERNEE ? "bg-white text-steel-900 shadow-xs" : "text-steel-500 hover:text-steel-700"
              }`}
            >
              <GraduationCap className="h-4 w-4" /> Internee
            </button>
            <button
              type="button"
              onClick={() => setRole(ROLE_ADMIN)}
              className={`flex items-center justify-center gap-1.5 rounded-lg py-2 text-[13px] font-medium transition-all duration-150 ${
                role === ROLE_ADMIN ? "bg-white text-steel-900 shadow-xs" : "text-steel-500 hover:text-steel-700"
              }`}
            >
              <ShieldCheck className="h-4 w-4" /> Admin
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="Email"
              type="email"
              icon={Mail}
              placeholder="you@codecelix.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="username"
            />
            <Input
              label="Password"
              type="password"
              icon={Lock}
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="current-password"
              error={error}
            />
            <Button type="submit" className="w-full" size="lg" loading={loading}>
              Log in as {role === ROLE_ADMIN ? "Admin" : "Internee"}
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}
