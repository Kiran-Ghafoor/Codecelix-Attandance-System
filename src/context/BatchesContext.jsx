import { createContext, useCallback, useContext, useMemo, useState } from "react";
import { BATCHES } from "../lib/mockData";

// Session-local batch store. Seeds from the mock data layer and lets the
// admin create/update batches in memory — a stand-in for the future API so
// the list and detail pages stay consistent with each other.
const BatchesContext = createContext(null);

let newBatchSeq = 0;

function cloneBatches(batches) {
  return batches.map((b) => ({ ...b, domains: b.domains.map((d) => ({ ...d })) }));
}

function toDomainRows(domains, batchId) {
  return domains.map((d, index) => ({
    id: d.id || `dom-${batchId}-${index + 1}-${++newBatchSeq}`,
    name: d.name,
    teamLeaderId: d.teamLeaderId || null,
  }));
}

export function BatchesProvider({ children }) {
  const [batches, setBatches] = useState(() => cloneBatches(BATCHES));

  const createBatch = useCallback((payload) => {
    const id = `batch-new-${++newBatchSeq}`;
    const batch = {
      id,
      name: payload.name,
      status: payload.status,
      startDate: payload.startDate,
      endDate: payload.endDate,
      domains: toDomainRows(payload.domains, id),
    };
    setBatches((prev) => [batch, ...prev]);
    return batch;
  }, []);

  const updateBatch = useCallback((id, payload) => {
    setBatches((prev) =>
      prev.map((b) =>
        b.id !== id
          ? b
          : {
              ...b,
              name: payload.name,
              status: payload.status,
              startDate: payload.startDate,
              endDate: payload.endDate,
              domains: toDomainRows(payload.domains, b.id),
            }
      )
    );
  }, []);

  const value = useMemo(() => ({ batches, createBatch, updateBatch }), [batches, createBatch, updateBatch]);

  return <BatchesContext.Provider value={value}>{children}</BatchesContext.Provider>;
}

export function useBatches() {
  const ctx = useContext(BatchesContext);
  if (!ctx) throw new Error("useBatches must be used within BatchesProvider");
  return ctx;
}
