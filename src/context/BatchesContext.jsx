import { createContext, useCallback, useContext, useMemo, useState } from "react";
import { BATCHES } from "../lib/mockData";

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

function generateBatchCode(number, program, year) {
  return `B${number}-${program.toUpperCase()}-${year}`;
}

export function BatchesProvider({ children }) {
  const [batches, setBatches] = useState(() => cloneBatches(BATCHES));

  const isDuplicateCode = useCallback(
    (code, excludeId = null) => batches.some((b) => b.batchCode === code && b.id !== excludeId),
    [batches]
  );

  const createBatch = useCallback(
    (payload) => {
      const batchCode = generateBatchCode(payload.batchNumber, payload.program, payload.year);
      if (isDuplicateCode(batchCode)) {
        throw new Error(`Batch code "${batchCode}" already exists.`);
      }
      const id = `batch-${payload.batchNumber}-${Date.now()}`;
      const batch = {
        id,
        batchCode,
        batchNumber: payload.batchNumber,
        program: payload.program,
        year: payload.year,
        status: payload.status || "Active",
        startDate: payload.startDate,
        endDate: payload.endDate,
        domains: toDomainRows(payload.domains, id),
      };
      setBatches((prev) => [batch, ...prev]);
      return batch;
    },
    [isDuplicateCode]
  );

  const updateBatch = useCallback(
    (id, payload) => {
      const batchCode = generateBatchCode(payload.batchNumber, payload.program, payload.year);
      if (isDuplicateCode(batchCode, id)) {
        throw new Error(`Batch code "${batchCode}" already exists.`);
      }
      setBatches((prev) =>
        prev.map((b) =>
          b.id !== id
            ? b
            : {
                ...b,
                batchCode,
                batchNumber: payload.batchNumber,
                program: payload.program,
                year: payload.year,
                status: payload.status,
                startDate: payload.startDate,
                endDate: payload.endDate,
                domains: toDomainRows(payload.domains, b.id),
              }
        )
      );
    },
    [isDuplicateCode]
  );

  const toggleBatchStatus = useCallback((id) => {
    setBatches((prev) =>
      prev.map((b) => {
        if (b.id !== id) return b;
        const next = b.status === "Active" ? "Inactive" : "Active";
        return { ...b, status: next };
      })
    );
  }, []);

  const activeBatches = useMemo(
    () => batches.filter((b) => b.status === "Active"),
    [batches]
  );

  const value = useMemo(
    () => ({ batches, activeBatches, createBatch, updateBatch, toggleBatchStatus, isDuplicateCode }),
    [batches, activeBatches, createBatch, updateBatch, toggleBatchStatus, isDuplicateCode]
  );

  return <BatchesContext.Provider value={value}>{children}</BatchesContext.Provider>;
}

export function useBatches() {
  const ctx = useContext(BatchesContext);
  if (!ctx) throw new Error("useBatches must be used within BatchesProvider");
  return ctx;
}
