import { createContext, useCallback, useContext, useMemo, useState } from "react";
import { INTERNEES } from "../lib/mockData";

// Session-local internee roster. Seeds from the mock data layer and lets the
// ADMIN add internees manually (batch + domain assignment) — a stand-in for
// the future API so the roster pages stay consistent within a session.
//
// Admin-only by construction: this provider is mounted exclusively under the
// /admin route tree behind ProtectedRoute role="admin" (see App.jsx), and no
// internee-side page exposes write access to this store.
const InterneesContext = createContext(null);

let addedSeq = 0;

export function InterneesProvider({ children }) {
  const [internees, setInternees] = useState(() => INTERNEES.map((i) => ({ ...i })));

  const addInternee = useCallback((payload) => {
    const internee = {
      id: payload.id ?? `int-new-${Date.now().toString(36)}-${++addedSeq}`,
      name: payload.name,
      email: payload.email,
      phone: payload.phone ?? null,
      cnic: payload.cnic ?? null,
      batchId: payload.batchId,
      domainId: payload.domainId,
      // Fresh joiners start with a clean slate; real values arrive from the API.
      attendance: payload.attendance ?? 100,
      status: payload.status ?? "Active",
    };
    setInternees((prev) => [internee, ...prev]);
    return internee;
  }, []);

  const value = useMemo(() => ({ internees, addInternee }), [internees, addInternee]);

  return <InterneesContext.Provider value={value}>{children}</InterneesContext.Provider>;
}

export function useInternees() {
  const ctx = useContext(InterneesContext);
  if (!ctx) throw new Error("useInternees must be used within InterneesProvider");
  return ctx;
}
