import { Navigate } from "react-router-dom";
import { useAuth, ROLE_ADMIN, ROLE_INTERNEE } from "../context/AuthContext";

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
// ProtectedRoute — core guard. Checks authentication and optional role.
//
// Rules:
//   loading       → spinner
//   not logged in → /login
//   role mismatch → role-appropriate dashboard
// ---------------------------------------------------------------------------
export default function ProtectedRoute({ role, children }) {
  const { user, loading } = useAuth();

  if (loading) return <AuthSpinner />;
  if (!user) return <Navigate to="/login" replace />;
  if (role && user.role !== role) {
    return <Navigate to={user.role === ROLE_ADMIN ? "/admin/dashboard" : "/internee/dashboard"} replace />;
  }
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
// An Admin reaching an internee route is redirected to /admin/dashboard.
// ---------------------------------------------------------------------------
export function InterneeRoute({ children }) {
  return <ProtectedRoute role={ROLE_INTERNEE}>{children}</ProtectedRoute>;
}
