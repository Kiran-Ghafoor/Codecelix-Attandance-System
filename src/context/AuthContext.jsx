import { createContext, useContext, useState, useEffect, useCallback } from "react";
import { apiRequest } from "../lib/api";

// ---------------------------------------------------------------------------
// Role constants — use these everywhere instead of string literals.
// ---------------------------------------------------------------------------
export const ROLE_ADMIN = "admin";
export const ROLE_INTERNEE = "internee";

// ---------------------------------------------------------------------------
// Account status constants.
// ---------------------------------------------------------------------------
export const STATUS_PENDING = "pending";
export const STATUS_APPROVED = "approved";
export const STATUS_REJECTED = "rejected";

// ---------------------------------------------------------------------------
// Auth context — manages current user, login, logout, and token persistence.
//
// The user object MUST contain:
//   id, name, email, role, emailVerified, status
//
// Access rules for internees (ALL must pass):
//   1. Valid credentials
//   2. emailVerified === true
//   3. status === "approved"
//   4. role === "internee"
//
// Denied access reasons:
//   pending  → status = "pending"  (waiting for admin approval)
//   rejected → status = "rejected" (application denied by admin)
//   unverified → emailVerified = false
//
// Admins: only role check is enforced. Admin status and email verification
// are managed separately and not gated by this context.
//
// The context exposes:
//   { user, login, register, verifyEmail, resendVerification, logout, loading, isAuthenticated }
// ---------------------------------------------------------------------------

const TOKEN_KEY = "auth_token";

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

  // ── Verify stored token on mount ────────────────────────────────────────
  useEffect(() => {
    let cancelled = false;

    async function verifySession() {
      const token = localStorage.getItem(TOKEN_KEY);

      if (!token) {
        if (!cancelled) setLoading(false);
        return;
      }

      try {
        const data = await apiRequest("/auth/me", { token });
        if (!cancelled && isValidUser(data.user)) {
          setUser(data.user);
        } else {
          localStorage.removeItem(TOKEN_KEY);
        }
      } catch {
        localStorage.removeItem(TOKEN_KEY);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    verifySession();
    return () => { cancelled = true; };
  }, []);

  // ── Login ───────────────────────────────────────────────────────────────
  // The backend MUST verify ALL of the following before returning a token:
  //   1. Credentials are valid (email + password match)
  //   2. emailVerified === true
  //   3. status === "approved"
  //   4. role is set correctly
  //
  // If any condition fails, the backend MUST return an error WITHOUT a token:
  //   401 → invalid credentials
  //   403 → { message, code: "EMAIL_NOT_VERIFIED" }  — email not verified
  //   403 → { message, code: "ACCOUNT_PENDING" }     — awaiting approval
  //   403 → { message, code: "ACCOUNT_REJECTED" }    — application rejected
  //
  // The frontend uses the `code` field to show the correct denial screen.
  // ---------------------------------------------------------------------------
  const login = useCallback(async (email, password) => {
    const data = await apiRequest("/auth/login", {
      method: "POST",
      body: { email, password },
    });

    if (!isValidUser(data.user)) {
      throw new Error("Invalid user data received from server.");
    }

    localStorage.setItem(TOKEN_KEY, data.token);
    setUser(data.user);
  }, []);

  // ── Register ─────────────────────────────────────────────────────────────
  // Backend MUST:
  //   1. Hash password with bcrypt/argon2 (NEVER store plain text)
  //   2. Check email uniqueness → 409 if duplicate
  //   3. Check CNIC uniqueness → 409 if duplicate
  //   4. Generate verification token (expires in 24h)
  //   5. Create user with status="pending", emailVerified=false
  //   6. Send verification email
  const register = useCallback(async ({ name, email, password, cnic, phone, batchCode, batchId, domain }) => {
    const data = await apiRequest("/auth/register", {
      method: "POST",
      body: { name, email, password, cnic, phone, batchCode, batchId, domain },
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

  // ── Logout ──────────────────────────────────────────────────────────────
  const logout = useCallback(() => {
    localStorage.removeItem(TOKEN_KEY);
    setUser(null);
  }, []);

  const isAuthenticated = user !== null;

  return (
    <AuthContext.Provider value={{ user, login, register, verifyEmail, resendVerification, logout, loading, isAuthenticated }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
