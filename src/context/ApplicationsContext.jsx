import { createContext, useCallback, useContext, useMemo, useState } from "react";

// ---------------------------------------------------------------------------
// Applications context — manages internee registration applications.
//
// Each application represents a pending registration. Admins can approve or
// reject them.
//
// Backend MUST enforce:
//   - Only users with role="admin" can call approve/reject endpoints
//   - Approve sets status="approved" on the user document
//   - Reject sets status="rejected" + stores rejectionReason
//   - Both record reviewedAt timestamp and reviewedBy admin id
//
// Expected backend endpoints:
//   GET    /admin/applications              → { applications: [...] }
//   POST   /admin/applications/:id/approve  → { message }
//   POST   /admin/applications/:id/reject   → { message, reason? }
// ---------------------------------------------------------------------------

const MOCK_APPLICATIONS = [
  {
    id: "app-001",
    name: "Zainab Malik",
    email: "zainab.malik@example.com",
    cnic: "35201-4567890-2",
    phone: "+92 312 6543210",
    batchCode: "B12-CODECELIX-2026",
    domain: "web",
    status: "pending",
    emailVerified: true,
    createdAt: "2026-08-20T10:30:00",
    rejectionReason: null,
  },
  {
    id: "app-002",
    name: "Hamza Tariq",
    email: "hamza.tariq@example.com",
    cnic: "33102-7654321-5",
    phone: "+92 300 1112233",
    batchCode: "B12-CODECELIX-2026",
    domain: "ai",
    status: "pending",
    emailVerified: false,
    createdAt: "2026-08-21T14:15:00",
    rejectionReason: null,
  },
  {
    id: "app-003",
    name: "Amina Shah",
    email: "amina.shah@example.com",
    cnic: "42101-9876543-8",
    phone: "+92 333 4445566",
    batchCode: "B11-CODECELIX-2026",
    domain: "cyber",
    status: "approved",
    emailVerified: true,
    createdAt: "2026-08-18T09:00:00",
    rejectionReason: null,
    reviewedAt: "2026-08-19T11:00:00",
    reviewedBy: "Ayesha Khan",
  },
  {
    id: "app-004",
    name: "Bilal Ahmed",
    email: "bilal.ahmed@example.com",
    cnic: "37405-1122334-1",
    phone: "+92 321 7788990",
    batchCode: "B12-CODECELIX-2026",
    domain: "data",
    status: "rejected",
    emailVerified: true,
    createdAt: "2026-08-17T16:45:00",
    rejectionReason: "CNIC already registered with another account.",
    reviewedAt: "2026-08-18T10:30:00",
    reviewedBy: "Ayesha Khan",
  },
  {
    id: "app-005",
    name: "Noor Fatima",
    email: "noor.fatima@example.com",
    cnic: "38201-5566778-3",
    phone: "+92 345 2233445",
    batchCode: "B13-CODECELIX-2026",
    domain: "uiux",
    status: "pending",
    emailVerified: true,
    createdAt: "2026-08-22T08:20:00",
    rejectionReason: null,
  },
];

const ApplicationsContext = createContext(null);

export function ApplicationsProvider({ children }) {
  const [applications, setApplications] = useState(() => MOCK_APPLICATIONS.map((a) => ({ ...a })));

  const approveApplication = useCallback((id) => {
    setApplications((prev) =>
      prev.map((a) =>
        a.id === id
          ? { ...a, status: "approved", reviewedAt: new Date().toISOString(), rejectionReason: null }
          : a
      )
    );
  }, []);

  const rejectApplication = useCallback((id, reason = "") => {
    setApplications((prev) =>
      prev.map((a) =>
        a.id === id
          ? { ...a, status: "rejected", rejectionReason: reason || null, reviewedAt: new Date().toISOString() }
          : a
      )
    );
  }, []);

  const value = useMemo(
    () => ({ applications, approveApplication, rejectApplication }),
    [applications, approveApplication, rejectApplication]
  );

  return <ApplicationsContext.Provider value={value}>{children}</ApplicationsContext.Provider>;
}

export function useApplications() {
  const ctx = useContext(ApplicationsContext);
  if (!ctx) throw new Error("useApplications must be used within ApplicationsProvider");
  return ctx;
}
