import { createContext, useContext, useState, useEffect, useCallback } from "react";
import { apiRequest } from "../lib/api";

// ---------------------------------------------------------------------------
// Role constants — use these everywhere instead of string literals.
// ---------------------------------------------------------------------------
export const ROLE_ADMIN = "admin";
export const ROLE_INTERNEE = "internee";

// ---------------------------------------------------------------------------
// Auth context — manages current user, login, logout, and token persistence.
//
// Expected backend endpoints (not implemented yet):
//   POST /auth/login   → { token, user: { id, name, email, role } }
//   GET  /auth/me      → { user: { id, name, email, role } }
//
// The user object MUST contain: id, name, email, role.
// Role must be ROLE_ADMIN or ROLE_INTERNEE.
//
// The context exposes { user, login, logout, loading, isAuthenticated }.
// ---------------------------------------------------------------------------

const TOKEN_KEY = "auth_token";

const AuthContext = createContext(null);

function isValidUser(u) {
  return u && typeof u.id === "string" && typeof u.name === "string" && typeof u.email === "string" && typeof u.role === "string";
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

  // ── Logout ──────────────────────────────────────────────────────────────
  const logout = useCallback(() => {
    localStorage.removeItem(TOKEN_KEY);
    setUser(null);
  }, []);

  const isAuthenticated = user !== null;

  return (
    <AuthContext.Provider value={{ user, login, logout, loading, isAuthenticated }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
