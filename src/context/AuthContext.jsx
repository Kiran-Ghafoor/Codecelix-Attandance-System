import { createContext, useContext, useState, useEffect, useCallback } from "react";
import { apiRequest } from "../lib/api";

// ---------------------------------------------------------------------------
// Role constants — use these everywhere instead of string literals.
// ---------------------------------------------------------------------------
export const ROLE_ADMIN = "admin";
export const ROLE_INTERNEE = "internee";

// ---------------------------------------------------------------------------
// Auth context — manages current user, login, logout, and session restore.
//
// Authentication is handled by the backend via an httpOnly JWT cookie. The
// frontend NEVER stores, reads, or sends a JWT; the browser attaches the
// cookie to every request (see apiRequest's `credentials: "include"`).
//
// The user object MUST contain:
//   id, name, email, role, emailVerified
//
// Access rules for internees (ALL must pass):
//   1. Valid credentials
//   2. emailVerified === true
//   3. role === "internee"
//
// NOTE: Email verification auto-activates the account. There is NO admin
// approval step in this flow — after verifying their email the internee can
// log in immediately.
//
// Denied access reason:
//   unverified → emailVerified = false  (verify email first, then log in)
//
// Admins: only role check is enforced.
//
// The context exposes:
//   { user, login, register, verifyEmail, resendVerification, logout, loading, isAuthenticated }
// ---------------------------------------------------------------------------

const AuthContext = createContext(null);

function isValidUser(u) {
  return (
    u &&
    typeof u.id === "string" &&
    typeof u.name === "string" &&
    typeof u.email === "string" &&
    typeof u.role === "string"
  );
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // ── Restore session on mount ────────────────────────────────────────────
  // Ask /auth/me for the current user. The httpOnly JWT cookie authenticates
  // the request automatically. If there is no valid session (no cookie, or an
  // expired/unverifiable one) the backend returns 401 and we stay logged out.
  useEffect(() => {
    let cancelled = false;

    async function verifySession() {
      try {
        const data = await apiRequest("/auth/me");
        if (!cancelled && isValidUser(data.user)) {
          setUser(data.user);
        }
      } catch {
        // Unauthenticated/expired session — leave user as null.
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    verifySession();
    return () => { cancelled = true; };
  }, []);

  // ── Login ───────────────────────────────────────────────────────────────
  // The backend verifies credentials and sets the httpOnly JWT cookie. The
  // frontend then re-hydrates the user from /auth/me so it never depends on a
  // token in the response body.
  //
  // Denial reasons surfaced by the backend via ApiError `code`:
  //   401 → invalid credentials
  //   403 → { message, code: "EMAIL_NOT_VERIFIED" }  — email not verified
  // ---------------------------------------------------------------------------
  const login = useCallback(async (email, password) => {
    // 1. Authenticate — the backend sets the session cookie on success.
    await apiRequest("/auth/login", {
      method: "POST",
      body: { email, password },
    });

    // 2. Hydrate user state from /auth/me using the cookie just set.
    const data = await apiRequest("/auth/me");
    if (!isValidUser(data.user)) {
      throw new Error("Invalid user data received from server.");
    }
    setUser(data.user);
  }, []);

  // ── Register ─────────────────────────────────────────────────────────────
  // Sends registration details. Registration does NOT establish a session;
  // the user must verify their email (which auto-activates the account) and
  // then log in.
  const register = useCallback(async ({ name, cnic, email, phone, batchCode, batchId, domainId, domainName, password }) => {
    const data = await apiRequest("/auth/register", {
      method: "POST",
      body: { name, cnic, email, phone, batchCode, batchId, domainId, domainName, password },
    });

    return data;
  }, []);

  // ── Email verification ───────────────────────────────────────────────────
  const verifyEmail = useCallback(async (token) => {
    const data = await apiRequest(`/auth/verify-email?token=${encodeURIComponent(token)}`);
    return data;
  }, []);

  // ── Resend verification email ────────────────────────────────────────────
  const resendVerification = useCallback(async (email) => {
    const data = await apiRequest("/auth/resend-verification", {
      method: "POST",
      body: { email },
    });
    return data;
  }, []);

  // ── Forgot password (request reset link) ─────────────────────────────────
  const forgotPassword = useCallback(async (email) => {
    const data = await apiRequest("/auth/forgot-password", {
      method: "POST",
      body: { email },
    });
    return data;
  }, []);

  // ── Reset password (consumes the emailed one-time token) ─────────────────
  const resetPassword = useCallback(async (token, password) => {
    const data = await apiRequest("/auth/reset-password", {
      method: "POST",
      body: { token, password },
    });
    return data;
  }, []);

  // ── Logout ───────────────────────────────────────────────────────────────
  // Tell the backend to invalidate the session (clear the httpOnly cookie).
  // Then reset local state; the caller is responsible for redirecting.
  const logout = useCallback(async () => {
    try {
      await apiRequest("/auth/logout", { method: "POST" });
    } catch {
      // Even if the backend call fails (e.g. network), still clear local state.
    } finally {
      setUser(null);
    }
  }, []);

  // ── Update own email ─────────────────────────────────────────────────────
  // Lets a user change their own email. The session stays valid; we refresh
  // the in-memory user so the UI reflects the new email immediately.
  const updateEmail = useCallback(async (newEmail) => {
    const data = await apiRequest("/auth/email", { method: "PATCH", body: { email: newEmail } });
    setUser((prev) => (prev && data?.user ? { ...prev, email: data.user.email } : prev));
    return data;
  }, []);

  // ── Change own password ──────────────────────────────────────────────────
  const changePassword = useCallback(async (currentPassword, newPassword) => {
    return apiRequest("/auth/change-password", {
      method: "POST",
      body: { currentPassword, newPassword },
    });
  }, []);

  const isAuthenticated = user !== null;

  return (
    <AuthContext.Provider
      value={{ user, login, register, verifyEmail, resendVerification, forgotPassword, resetPassword, logout, updateEmail, changePassword, loading, isAuthenticated }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
