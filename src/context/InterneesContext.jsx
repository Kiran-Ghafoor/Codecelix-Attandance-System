import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { apiRequest } from "../lib/api";
import { useAuth } from "./AuthContext";

// ---------------------------------------------------------------------------
// Internees context — reads the approved internee roster from the real backend
// API (MongoDB), never compiled-in mock data.
//
// Data source:
//   GET /api/internees  →  { internees: [...] }  (admin)
//
// Manual admin "Add internee" is intentionally NOT supported here: the backend
// has no POST /api/internees endpoint (new internees arrive only through
// public self-registration, which auto-activates and appears in this roster).
// ---------------------------------------------------------------------------

const InterneesContext = createContext(null);

export function InterneesProvider({ children }) {
  const [internees, setInternees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { user } = useAuth();
  const isAuthed = Boolean(user);

  const refresh = useCallback(async () => {
    try {
      const data = await apiRequest("/internees");
      const list = Array.isArray(data.internees) ? data.internees : [];
      setInternees(list);
      setError(null);
    } catch (err) {
      setError(err?.message || "Could not load internees.");
      setInternees([]);
    }
  }, []);

  // Load the roster after login/logout so admin pages always show the live
  // backend list.
  useEffect(() => {
    if (!isAuthed) {
      setInternees([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    refresh().finally(() => setLoading(false));
  }, [isAuthed, refresh]);

  const value = useMemo(
    () => ({ internees, loading, error, refresh }),
    [internees, loading, error, refresh]
  );

  return <InterneesContext.Provider value={value}>{children}</InterneesContext.Provider>;
}

export function useInternees() {
  const ctx = useContext(InterneesContext);
  if (!ctx) throw new Error("useInternees must be used within InterneesProvider");
  return ctx;
}
