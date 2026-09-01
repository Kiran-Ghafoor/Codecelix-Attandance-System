import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { apiRequest } from "../lib/api";
import { useAuth } from "./AuthContext";

// ---------------------------------------------------------------------------
// Batches context — reads and writes batches through the real backend API.
//
// Data source: MongoDB via the backend, never compiled-in mock data.
//   GET  /api/batches          → full list (admin). Registration page (public)
//                                falls back to GET /api/batches/active.
//   POST /api/batches          → create (admin). Registration code auto-generated
//                                by the backend.
//   PATCH /api/batches/:id     → update (admin).
//   PATCH /api/batches/:id/toggle-status → activate/deactivate (admin).
//
// Exposes the same interface the UI already expects:
//   { batches, activeBatches, loading, error, refresh,
//     createBatch, updateBatch, toggleBatchStatus, isDuplicateCode }
//
// The batch shape mirrors the backend's toPublicJSON():
//   { id, batchCode, batchNumber, program, year, status, startDate, endDate,
//     registrationCode, internCount, domains:[{ id, name, teamLeaderId, internCount }] }
// ---------------------------------------------------------------------------

const BatchesContext = createContext(null);

export function BatchesProvider({ children }) {
  const [batches, setBatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { user } = useAuth();
  const isAuthed = Boolean(user);

  // Load the batch list. Admins get the full list (with registration codes);
  // unauthenticated visitors (registration page) fall back to the public
  // active-batches endpoint, which deliberately omits registration codes.
  const refresh = useCallback(async () => {
    try {
      const data = await apiRequest("/batches");
      const list = Array.isArray(data.batches) ? data.batches : [];
      setBatches(list);
      setError(null);
    } catch (err) {
      const data = await apiRequest("/batches/active").catch(() => null);
      if (data && Array.isArray(data.batches)) {
        setBatches(data.batches);
        setError(null);
      } else {
        setError(err?.message || "Could not load batches.");
        setBatches([]);
      }
    }
  }, []);

  // Load the initial batch list, then re-fetch whenever the auth state changes
  // (login/logout / session restore) so admin pages always get the full backend
  // list (with registration codes) and public pages get the public active list.
  useEffect(() => {
    refresh().finally(() => setLoading(false));
  }, [isAuthed, refresh]);

  const isDuplicateCode = useCallback(
    (code, excludeId = null) => batches.some((b) => b.batchCode === code && b.id !== excludeId),
    [batches]
  );

  const createBatch = useCallback(
    async (payload) => {
      // Match the backend contract: batchCode, domains (with names), plus
      // optional derived/status fields. The backend derives batchNumber/year
      // from the code when not supplied, and generates the registration code.
      const res = await apiRequest("/batches", {
        method: "POST",
        body: {
          batchCode: payload.batchCode,
          program: payload.program,
          mode: payload.mode,
          year: payload.year,
          status: payload.status,
          startDate: payload.startDate,
          endDate: payload.endDate,
          registrationCode: payload.registrationCode,
          domains: (payload.domains || []).map((d) => ({ id: d.id || null, name: d.name, teamLeaderId: d.teamLeaderId || null })),
        },
      });
      const created = res?.batch;
      if (created) setBatches((prev) => [created, ...prev]);
      return created;
    },
    []
  );

  const updateBatch = useCallback(async (id, payload) => {
    const res = await apiRequest(`/batches/${id}`, {
      method: "PATCH",
      body: {
        batchCode: payload.batchCode,
        program: payload.program,
        mode: payload.mode,
        year: payload.year,
        status: payload.status,
        startDate: payload.startDate,
        endDate: payload.endDate,
        domains: (payload.domains || []).map((d) => ({ id: d.id || null, name: d.name, teamLeaderId: d.teamLeaderId || null })),
      },
    });
    const updated = res?.batch;
    if (updated) setBatches((prev) => prev.map((b) => (b.id === updated.id ? updated : b)));
    return updated;
  }, []);

  const toggleBatchStatus = useCallback(async (id) => {
    const res = await apiRequest(`/batches/${id}/toggle-status`, { method: "PATCH" });
    const updated = res?.batch;
    if (updated) setBatches((prev) => prev.map((b) => (b.id === updated.id ? updated : b)));
    return updated;
  }, []);

  const activeBatches = useMemo(() => batches.filter((b) => b.status === "Active"), [batches]);

  const value = useMemo(
    () => ({
      batches,
      activeBatches,
      loading,
      error,
      refresh,
      createBatch,
      updateBatch,
      toggleBatchStatus,
      isDuplicateCode,
    }),
    [batches, activeBatches, loading, error, refresh, createBatch, updateBatch, toggleBatchStatus, isDuplicateCode]
  );

  return <BatchesContext.Provider value={value}>{children}</BatchesContext.Provider>;
}

export function useBatches() {
  const ctx = useContext(BatchesContext);
  if (!ctx) throw new Error("useBatches must be used within BatchesProvider");
  return ctx;
}
