import { Navigate } from "react-router-dom";
import { useAuth, ROLE_ADMIN, ROLE_INTERNEE, STATUS_APPROVED } from "../context/AuthContext";

// ---------------------------------------------------------------------------
// Loading spinner shown while the stored token is being verified on mount.
// ---------------------------------------------------------------------------
function AuthSpinner() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-steel-50">
      <div className="h-8 w-8 animate-spin rounded-full border-2 border-steel-200 border-t-brand-600" />
    </div>
  );
}

// ---------------------------------------------------------------------------
// Internee access gate — enforces ALL of the following:
//   1. User is authenticated (token valid)
//   2. role === "internee"
//   3. emailVerified === true
//   4. status === "approved"
//
// If any condition fails, the internee is redirected to the appropriate
// denial page. This is the FRONTEND defense layer — the backend MUST also
// enforce these checks on every API call. Never rely on the frontend alone.
// ---------------------------------------------------------------------------
function checkInterneeAccess(user) {
  if (user.role !== ROLE_INTERNEE) return { allowed: false, redirectTo: "/admin/dashboard" };
  if (!user.emailVerified) return { allowed: false, redirectTo: "/login", reason: "unverified" };
  if (user.status !== STATUS_APPROVED) {
    return { allowed: false, redirectTo: "/login", reason: user.status };
  }
  return { allowed: true };
}

// ---------------------------------------------------------------------------
// ProtectedRoute — core guard. Checks authentication and optional role.
//
// For admins: role check only (admin status managed separately).
// For internees: role + emailVerified + status === "approved".
// ---------------------------------------------------------------------------
export default function ProtectedRoute({ role, children }) {
  const { user, loading } = useAuth();

  if (loading) return <AuthSpinner />;
  if (!user) return <Navigate to="/login" replace />;

  // ── Admin route ───────────────────────────────────────────────────────
  if (role === ROLE_ADMIN) {
    if (user.role !== ROLE_ADMIN) {
      return <Navigate to={user.role === ROLE_INTERNEE ? "/internee/dashboard" : "/login"} replace />;
    }
    return children;
  }

  // ── Internee route — enforce full access gate ─────────────────────────
  if (role === ROLE_INTERNEE) {
    if (user.role !== ROLE_INTERNEE) {
      return <Navigate to={user.role === ROLE_ADMIN ? "/admin/dashboard" : "/login"} replace />;
    }

    const gate = checkInterneeAccess(user);
    if (!gate.allowed) {
      // Pass reason via URL so the login page can show the right denial message
      const params = new URLSearchParams();
      if (gate.reason) params.set("reason", gate.reason);
      if (gate.reason === "unverified") params.set("email", user.email);
      const qs = params.toString() ? `?${params.toString()}` : "";
      return <Navigate to={`${gate.redirectTo}${qs}`} replace />;
    }

    return children;
  }

  // ── No role specified — just require authentication ───────────────────
  return children;
}

// ---------------------------------------------------------------------------
// AdminRoute — shorthand for <ProtectedRoute role={ROLE_ADMIN}>.
// An Internee reaching an admin route is redirected to /internee/dashboard.
// ---------------------------------------------------------------------------
export function AdminRoute({ children }) {
  return <ProtectedRoute role={ROLE_ADMIN}>{children}</ProtectedRoute>;
}

// ---------------------------------------------------------------------------
// InterneeRoute — shorthand for <ProtectedRoute role={ROLE_INTERNEE}>.
// Enforces the full access gate (approved + verified + role).
// ---------------------------------------------------------------------------
export function InterneeRoute({ children }) {
  return <ProtectedRoute role={ROLE_INTERNEE}>{children}</ProtectedRoute>;
}
