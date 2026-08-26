// ---------------------------------------------------------------------------
// Mock data layer. Every value here stands in for a future MERN API response.
// Shapes are written to mirror what a real REST/GraphQL payload would look
// like, so swapping this file for real fetch calls later is a small change.
//
// Hierarchy: Batch -> Domain -> Team Leader (enrolled internee ref) + Internees.
// Domains reference their team leader by INTERNEE id — only internees enrolled
// in that batch can lead one of its domains. Internees reference the domain
// they belong to via domainId. Aggregates (counts) are derived from these
// relations rather than stored by hand.
// ---------------------------------------------------------------------------

import { isWeekend } from "./dateUtils";

export const CURRENT_USER = {
  id: "int-014",
  role: "internee", // "internee" | "admin"
  name: "Kiran Ahmed",
  email: "kiran.ahmed@codecelix.com",
  avatarInitials: "KA",
  batch: "Batch 2",
  batchId: "batch-2",
  domainId: "dom-201",
  joinDate: "2026-06-01",
  phone: "+92 300 1234567",
  mentor: "Fatima Noor",
  mentorId: "tl-004",
};

export const ADMIN_USER = {
  id: "adm-001",
  role: "admin",
  name: "Ayesha Khan",
  email: "ayesha.khan@codecelix.com",
  avatarInitials: "AK",
  title: "Program Administrator",
};

// Users who act as team leaders for one or more batch domains.
// Referenced from domains via `teamLeaderId`.
export const USERS = [
  { id: "tl-001", role: "team_leader", name: "Ahmed Khan", email: "ahmed.khan@codecelix.com", avatarInitials: "AK" },
  { id: "tl-002", role: "team_leader", name: "Sara Ali", email: "sara.ali@codecelix.com", avatarInitials: "SA" },
  { id: "tl-003", role: "team_leader", name: "Ali Raza", email: "ali.raza@codecelix.com", avatarInitials: "AR" },
  { id: "tl-004", role: "team_leader", name: "Fatima Noor", email: "fatima.noor@codecelix.com", avatarInitials: "FN" },
  { id: "tl-005", role: "team_leader", name: "Bilal Hussain", email: "bilal.hussain@codecelix.com", avatarInitials: "BH" },
  { id: "tl-006", role: "team_leader", name: "Hina Shahid", email: "hina.shahid@codecelix.com", avatarInitials: "HS" },
  { id: "tl-007", role: "team_leader", name: "Omar Farooq", email: "omar.farooq@codecelix.com", avatarInitials: "OF" },
  { id: "tl-008", role: "team_leader", name: "Areeba Zaidi", email: "areeba.zaidi@codecelix.com", avatarInitials: "AZ" },
];

export const BATCHES = [
  {
    id: "batch-1",
    batchCode: "B1-COURSERA-2026",
    batchNumber: 1,
    program: "Coursera",
    year: 2026,
    status: "Active",
    startDate: "2026-03-10",
    endDate: "2026-09-10",
    domains: [
      { id: "dom-101", name: "AI", teamLeaderId: "int-002" },
      { id: "dom-102", name: "Web Development", teamLeaderId: "int-001" },
      { id: "dom-103", name: "UI/UX", teamLeaderId: "int-003" },
    ],
  },
  {
    id: "batch-2",
    batchCode: "B2-COURSERA-2026",
    batchNumber: 2,
    program: "Coursera",
    year: 2026,
    status: "Active",
    startDate: "2026-06-01",
    endDate: "2026-12-01",
    domains: [
      { id: "dom-201", name: "Network Security", teamLeaderId: "int-022" },
      { id: "dom-202", name: "Web Development", teamLeaderId: "int-016" },
      { id: "dom-203", name: "AI", teamLeaderId: "int-024" },
    ],
  },
  {
    id: "batch-3",
    batchCode: "B3-COURSERA-2026",
    batchNumber: 3,
    program: "Coursera",
    year: 2026,
    status: "Active",
    startDate: "2026-07-15",
    endDate: "2027-01-15",
    domains: [
      { id: "dom-301", name: "UI/UX", teamLeaderId: "int-025" },
      { id: "dom-302", name: "Web Development", teamLeaderId: "int-026" },
    ],
  },
  {
    id: "batch-4",
    batchCode: "B0-COURSERA-2025",
    batchNumber: 0,
    program: "Coursera",
    year: 2025,
    status: "Completed",
    startDate: "2025-11-01",
    endDate: "2026-05-01",
    domains: [
      { id: "dom-401", name: "Web Development", teamLeaderId: "int-029" },
      { id: "dom-402", name: "Graphic Design", teamLeaderId: "int-031" },
    ],
  },
];

export const INTERNEES = [
  // --- Batch 1 -------------------------------------------------------------
  { id: "int-001", name: "Ali Raza", email: "ali.raza.int@codecelix.com", batchId: "batch-1", domainId: "dom-102", attendance: 96, status: "Active" },
  { id: "int-002", name: "Sara Nawaz", email: "sara.nawaz@codecelix.com", batchId: "batch-1", domainId: "dom-101", attendance: 88, status: "Active" },
  { id: "int-003", name: "Bilal Ahmed", email: "bilal.ahmed@codecelix.com", batchId: "batch-1", domainId: "dom-103", attendance: 74, status: "Active" },
  { id: "int-018", name: "Hassan Javed", email: "hassan.javed@codecelix.com", batchId: "batch-1", domainId: "dom-101", attendance: 92, status: "Active" },
  { id: "int-019", name: "Aiman Yousaf", email: "aiman.yousaf@codecelix.com", batchId: "batch-1", domainId: "dom-101", attendance: 69, status: "Warning" },
  { id: "int-020", name: "Danish Iqbal", email: "danish.iqbal@codecelix.com", batchId: "batch-1", domainId: "dom-102", attendance: 85, status: "Active" },
  { id: "int-021", name: "Rabia Aslam", email: "rabia.aslam@codecelix.com", batchId: "batch-1", domainId: "dom-103", attendance: 90, status: "Active" },

  // --- Batch 2 -------------------------------------------------------------
  { id: "int-014", name: "Kiran Ahmed", email: "kiran.ahmed@codecelix.com", batchId: "batch-2", domainId: "dom-201", attendance: 91, status: "Active" },
  { id: "int-015", name: "Hamza Tariq", email: "hamza.tariq@codecelix.com", batchId: "batch-2", domainId: "dom-201", attendance: 82, status: "Active" },
  { id: "int-016", name: "Mahnoor Fatima", email: "mahnoor.fatima@codecelix.com", batchId: "batch-2", domainId: "dom-202", attendance: 100, status: "Active" },
  { id: "int-017", name: "Usman Ghani", email: "usman.ghani@codecelix.com", batchId: "batch-2", domainId: "dom-203", attendance: 65, status: "Warning" },
  { id: "int-022", name: "Noor ul Ain", email: "noor.ulain@codecelix.com", batchId: "batch-2", domainId: "dom-201", attendance: 87, status: "Active" },
  { id: "int-023", name: "Talha Munir", email: "talha.munir@codecelix.com", batchId: "batch-2", domainId: "dom-202", attendance: 78, status: "Active" },
  { id: "int-024", name: "Iqra Batool", email: "iqra.batool@codecelix.com", batchId: "batch-2", domainId: "dom-203", attendance: 94, status: "Active" },

  // --- Batch 3 -------------------------------------------------------------
  { id: "int-025", name: "Zara Malik", email: "zara.malik@codecelix.com", batchId: "batch-3", domainId: "dom-301", attendance: 93, status: "Active" },
  { id: "int-026", name: "Fahad Sheikh", email: "fahad.sheikh@codecelix.com", batchId: "batch-3", domainId: "dom-302", attendance: 79, status: "Active" },
  { id: "int-027", name: "Maha Qureshi", email: "maha.qureshi@codecelix.com", batchId: "batch-3", domainId: "dom-301", attendance: 89, status: "Active" },
  { id: "int-028", name: "Saad Rehman", email: "saad.rehman@codecelix.com", batchId: "batch-3", domainId: "dom-302", attendance: 72, status: "Warning" },

  // --- Batch 0 (Pilot Cohort, completed) ------------------------------------
  { id: "int-029", name: "Waleed Anwar", email: "waleed.anwar@codecelix.com", batchId: "batch-4", domainId: "dom-401", attendance: 95, status: "Completed" },
  { id: "int-030", name: "Sana Ullah", email: "sana.ullah@codecelix.com", batchId: "batch-4", domainId: "dom-401", attendance: 84, status: "Completed" },
  { id: "int-031", name: "Ayesha Siddiqui", email: "ayesha.siddiqui@codecelix.com", batchId: "batch-4", domainId: "dom-402", attendance: 98, status: "Completed" },
];

// --- Relation helpers (stand-ins for future API queries) --------------------

export function getUserById(id) {
  return USERS.find((u) => u.id === id) ?? null;
}

export function getInterneeById(id, list = INTERNEES) {
  return list.find((i) => i.id === id) ?? null;
}

// Team leaders are enrolled internees. Resolves a domain's teamLeaderId via
// the given roster (pass the live session roster so manually added internees
// resolve too); falls back to legacy user records for safety.
export function getDomainLeader(teamLeaderId, list = INTERNEES) {
  if (!teamLeaderId) return null;
  return getInterneeById(teamLeaderId, list) ?? getUserById(teamLeaderId);
}

// Roster lookups accept an optional list so session-local additions (see
// InterneesContext) are visible without touching the static seed.
export function getDomainInternees(domainId, list = INTERNEES) {
  return list.filter((i) => i.domainId === domainId);
}

export function countDomainInternees(domainId, list = INTERNEES) {
  return getDomainInternees(domainId, list).length;
}

export function countBatchInternees(batch, list = INTERNEES) {
  if (!batch?.domains) return 0;
  return batch.domains.reduce((sum, d) => sum + countDomainInternees(d.id, list), 0);
}

// Maps domainId -> { batch, domain }. Accepts any batch list so callers can
// resolve against the live session batches (see BatchesContext) and pick up
// admin edits like renamed domains or reassigned team leaders.
export function buildDomainIndex(batches) {
  const index = new Map();
  (batches ?? []).forEach((batch) => {
    (batch.domains ?? []).forEach((domain) => index.set(domain.id, { batch, domain }));
  });
  return index;
}

// Stand-in for the future attendance aggregation endpoint. Kiran reuses her
// canonical summary below; everyone else gets a stable derived split where
// present + late + absent always equals totalDays.
export function getAttendanceSummary(internee) {
  if (!internee) return null;
  if (internee.id === CURRENT_USER.id) return ATTENDANCE_SUMMARY;
  const totalDays = 26;
  const missed = Math.round((totalDays * (100 - internee.attendance)) / 100);
  const late = Math.min(missed, Math.floor(missed / 2));
  const absent = missed - late;
  return { percentage: internee.attendance, present: totalDays - missed, late, absent, totalDays };
}

// Most recent submissions first. Timestamps stay structured ("HH:MM" 24-hour
// strings / ISO datetimes); formatting to 12-hour display happens in the UI
// via lib/format.js so the future backend can keep owning raw values.
export function getInterneeSubmissions(interneeId) {
  return SUBMISSIONS.filter((s) => s.interneeId === interneeId).sort((a, b) =>
    `${b.date} ${b.submittedAt ?? ""}`.localeCompare(`${a.date} ${a.submittedAt ?? ""}`)
  );
}

export function getSubmissionById(id) {
  return SUBMISSIONS.find((s) => s.id === id) ?? null;
}

// Attendance is derived by the backend from submission timing vs deadline.
// present -> submitted before deadline, late -> submitted after deadline but same day,
// absent -> no submission for that day.
export const ATTENDANCE_HISTORY = [
  { date: "2026-08-24", status: "present", submittedAt: "18:42", deadline: "20:00" },
  { date: "2026-08-23", status: "off", submittedAt: null, deadline: null },
  { date: "2026-08-22", status: "off", submittedAt: null, deadline: null },
  { date: "2026-08-21", status: "present", submittedAt: "17:55", deadline: "20:00" },
  { date: "2026-08-20", status: "absent", submittedAt: null, deadline: "20:00" },
  { date: "2026-08-19", status: "present", submittedAt: "19:33", deadline: "20:00" },
  { date: "2026-08-18", status: "present", submittedAt: "18:02", deadline: "20:00" },
  { date: "2026-08-17", status: "late", submittedAt: "20:15", deadline: "20:00" },
  { date: "2026-08-16", status: "off", submittedAt: null, deadline: null },
  { date: "2026-08-15", status: "off", submittedAt: null, deadline: null },
];

export const ATTENDANCE_SUMMARY = {
  percentage: 91,
  present: 21,
  late: 3,
  absent: 2,
  totalDays: 26,
};

export const CURRENT_TASK = {
  id: "task-0824",
  title: "Week 12 — Cisco Packet Tracer Lab: VLAN Segmentation",
  assignedVia: "WhatsApp",
  deadline: "2026-08-24T20:00:00",
  status: "pending", // "pending" | "submitted" | "late" | "missed"
};

// Mock response shape returned when a submission is recorded. Attendance is
// determined by the backend from the server-side timestamp vs the configured
// deadline — the UI renders this value as-is and never computes it.
export const MOCK_SUBMISSION_RESPONSE = {
  ok: true,
  attendanceStatus: "present", // "present" | "late" | "absent" | "excused" | "pending"
};

// Task submissions. Tasks themselves are assigned externally (WhatsApp etc.);
// the platform only records what the internee submitted. Times, deadlines and
// file sizes stay structured (24-hour "HH:MM", ISO datetimes, raw bytes) —
// display formatting happens in the UI layer. `status` mirrors what the
// future backend will derive from the server-side submission timestamp vs the
// configured deadline; the frontend never calculates it.
export const SUBMISSIONS = [
  {
    id: "sub-3001",
    interneeId: "int-014",
    domainId: "dom-201",
    taskRef: "Week 11 — VLAN Segmentation Lab",
    batch: "Batch 2",
    date: "2026-08-23",
    type: "pdf",
    fileName: "vlan-lab-week11.pdf",
    fileSizeBytes: 1843200,
    githubUrl: null,
    note: null,
    submittedAt: "19:10",
    deadline: "2026-08-23T20:00:00",
    status: "on-time",
  },
  {
    id: "sub-3002",
    interneeId: "int-015",
    domainId: "dom-201",
    taskRef: "Week 11 — VLAN Segmentation Lab",
    batch: "Batch 2",
    date: "2026-08-23",
    type: "github",
    fileName: null,
    fileSizeBytes: null,
    githubUrl: "https://github.com/hamzatariq/network-lab-11",
    note: "Packet Tracer export included under /docs.",
    submittedAt: "20:31",
    deadline: "2026-08-23T20:00:00",
    status: "late",
  },
  {
    id: "sub-3003",
    interneeId: "int-016",
    domainId: "dom-202",
    taskRef: "Module 11 — REST Auth Flow",
    batch: "Batch 2",
    date: "2026-08-23",
    type: "pdf",
    fileName: "mahnoor-auth-module.pdf",
    fileSizeBytes: 1650000,
    githubUrl: null,
    note: null,
    submittedAt: "18:05",
    deadline: "2026-08-23T20:00:00",
    status: "on-time",
  },
  {
    id: "sub-3004",
    interneeId: "int-017",
    domainId: "dom-203",
    taskRef: "Week 11 — Image Classification Notebook",
    batch: "Batch 2",
    date: "2026-08-23",
    type: null,
    fileName: null,
    fileSizeBytes: null,
    githubUrl: null,
    note: null,
    submittedAt: null,
    deadline: "2026-08-23T20:00:00",
    status: "missing",
  },
  {
    id: "sub-3005",
    interneeId: "int-001",
    domainId: "dom-102",
    taskRef: "Module 7 — MERN Auth Middleware",
    batch: "Batch 1",
    date: "2026-08-23",
    type: "github",
    fileName: null,
    fileSizeBytes: null,
    githubUrl: "https://github.com/aliraza/mern-auth-module",
    note: null,
    submittedAt: "17:48",
    deadline: "2026-08-23T20:00:00",
    status: "on-time",
  },
  {
    id: "sub-3006",
    interneeId: "int-025",
    domainId: "dom-301",
    taskRef: "Sprint 4 — Design System Audit",
    batch: "Batch 3",
    date: "2026-08-22",
    type: "pdf",
    fileName: "zara-design-audit.pdf",
    fileSizeBytes: 3412000,
    githubUrl: null,
    note: null,
    submittedAt: "16:40",
    deadline: "2026-08-22T20:00:00",
    status: "on-time",
  },
  {
    id: "sub-3012",
    interneeId: "int-026",
    domainId: "dom-302",
    taskRef: "Module 10 — State Management",
    batch: "Batch 3",
    date: "2026-08-22",
    type: "github",
    fileName: null,
    fileSizeBytes: null,
    githubUrl: "https://github.com/fahadsheikh/state-management-demo",
    note: null,
    submittedAt: "19:58",
    deadline: "2026-08-22T20:00:00",
    status: "on-time",
  },
  {
    id: "sub-3006-k",
    interneeId: "int-014",
    domainId: "dom-201",
    taskRef: "Week 10 — Network Topology Design",
    batch: "Batch 2",
    date: "2026-08-22",
    type: "github",
    fileName: null,
    fileSizeBytes: null,
    githubUrl: "https://github.com/kiranahmed/network-topology-w10",
    note: "Includes Packet Tracer export under /docs.",
    submittedAt: "20:47",
    deadline: "2026-08-22T20:00:00",
    status: "late",
  },
  {
    id: "sub-3007",
    interneeId: "int-014",
    domainId: "dom-201",
    taskRef: "Week 9 — Subnetting Worksheet",
    batch: "Batch 2",
    date: "2026-08-21",
    type: "pdf",
    fileName: "subnetting-week9.pdf",
    fileSizeBytes: 952320,
    githubUrl: null,
    note: null,
    submittedAt: "17:55",
    deadline: "2026-08-21T20:00:00",
    status: "on-time",
  },
  {
    id: "sub-3008",
    interneeId: "int-014",
    domainId: "dom-201",
    taskRef: "Week 8 — Port Scan Report",
    batch: "Batch 2",
    date: "2026-08-19",
    type: "github",
    fileName: null,
    fileSizeBytes: null,
    githubUrl: "https://github.com/kiranahmed/port-scan-report",
    note: null,
    submittedAt: "19:33",
    deadline: "2026-08-19T20:00:00",
    status: "on-time",
  },
  {
    id: "sub-3009",
    interneeId: "int-014",
    domainId: "dom-201",
    taskRef: "Week 7 — Firewall Rules Lab",
    batch: "Batch 2",
    date: "2026-08-18",
    type: "pdf",
    fileName: "firewall-rules-w7.pdf",
    fileSizeBytes: 1241200,
    githubUrl: null,
    note: null,
    submittedAt: "18:02",
    deadline: "2026-08-18T20:00:00",
    status: "on-time",
  },
  {
    id: "sub-3010",
    interneeId: "int-014",
    domainId: "dom-201",
    taskRef: "Week 6 — Incident Response Drill",
    batch: "Batch 2",
    date: "2026-08-17",
    type: "pdf",
    fileName: "incident-response-w6.pdf",
    fileSizeBytes: 2100000,
    githubUrl: null,
    note: null,
    submittedAt: "20:15",
    deadline: "2026-08-17T20:00:00",
    status: "late",
  },
];

export const DAILY_ATTENDANCE_ROWS = [
  { internee: "Kiran Ahmed", interneeId: "int-014", submissionId: "sub-3001", submission: "PDF · vlan-lab-week11.pdf", submittedAt: "19:10", status: "present" },
  { internee: "Hamza Tariq", interneeId: "int-015", submissionId: "sub-3002", submission: "GitHub · network-lab-11", submittedAt: "20:31", status: "late" },
  { internee: "Mahnoor Fatima", interneeId: "int-016", submissionId: "sub-3003", submission: "PDF · mahnoor-auth-module.pdf", submittedAt: "18:05", status: "present" },
  { internee: "Usman Ghani", interneeId: "int-017", submissionId: null, submission: "—", submittedAt: null, status: "absent" },
];

export const ADMIN_STATS = {
  totalInternees: 52,
  activeBatches: 3,
  presentToday: 38,
  lateToday: 6,
  absentToday: 8,
  pendingSubmissions: 8,
};

export const ATTENDANCE_SETTINGS = {
  // Structured 24-hour "HH:MM" value; the UI renders it as 12-hour AM/PM.
  recurringDeadline: "23:59",
  recurringEnabled: true,
  specialDeadlines: [
    { id: "sd-1", date: "2026-08-25", deadline: "22:00", reason: "Project demo night — extended window" },
    { id: "sd-2", date: "2026-08-30", deadline: "23:59", reason: "Batch 2 project checkpoint — extended for demos" },
    { id: "sd-3", date: "2026-09-06", deadline: "16:00", reason: "Early close — admin offsite" },
  ],
};

export const MONTHLY_REPORT_PREVIEW = [
  { internee: "Kiran Ahmed", present: 21, late: 3, absent: 2, percentage: 91 },
  { internee: "Hamza Tariq", present: 19, late: 4, absent: 3, percentage: 88 },
  { internee: "Mahnoor Fatima", present: 25, late: 1, absent: 0, percentage: 100 },
  { internee: "Usman Ghani", present: 14, late: 5, absent: 7, percentage: 65 },
];

// ---------------------------------------------------------------------------
// Daily attendance records (admin Daily Attendance + Monthly Reports)
//
// One record per internee per day — exactly what the future backend will
// persist. The server derives `status` from the submission timestamp vs the
// configured deadline and links the submission when one exists; this dataset
// is what an attendance/report endpoint would return. The frontend renders
// and aggregates these rows but never derives a status itself.
//
// Backend-compatible row shape:
//   {
//     id: string,               // stable record id
//     date: "YYYY-MM-DD",
//     interneeId: string,
//     status: "present" | "late" | "absent" | "excused" | "pending",
//     submissionId: string|null, // links to SUBMISSIONS when a file/repo exists
//     submittedAt: "HH:MM"|null, // structured 24-hour value
//   }
// ---------------------------------------------------------------------------

const ATTENDANCE_WINDOW_START = "2026-07-01";

// The mock platform's "today" (matches CURRENT_TASK / ACTIVITY_LOG).
export const MOCK_CURRENT_DATE = "2026-08-24";

// Curated rows that line up with real SUBMISSIONS entries so admins can open
// the actual submission from the attendance record. Weekend dates (Sat/Sun)
// are excluded — those days are always "off".
const ATTENDANCE_OVERRIDES = {
  "int-014|2026-08-21": { status: "present", submissionId: "sub-3007", submittedAt: "17:55" },
  "int-014|2026-08-19": { status: "present", submissionId: "sub-3008", submittedAt: "19:33" },
  "int-014|2026-08-18": { status: "present", submissionId: "sub-3009", submittedAt: "18:02" },
  "int-014|2026-08-17": { status: "late", submissionId: "sub-3010", submittedAt: "20:15" },
};

function hashSeed(key) {
  let h = 2166136261;
  for (let i = 0; i < key.length; i++) {
    h ^= key.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

// Stateless PRNG so every module load produces identical data (SSR-safe).
function seededRandom(key) {
  let s = hashSeed(key);
  s = Math.imul(s ^ (s >>> 15), s | 1);
  s ^= s + Math.imul(s ^ (s >>> 7), s | 61);
  return ((s ^ (s >>> 14)) >>> 0) / 4294967296;
}

function isoAddDays(iso, days) {
  const [y, m, d] = iso.split("-").map(Number);
  const dt = new Date(y, m - 1, d + days);
  return `${dt.getFullYear()}-${String(dt.getMonth() + 1).padStart(2, "0")}-${String(dt.getDate()).padStart(2, "0")}`;
}

function minutesToHHMM(minutes) {
  return `${String(Math.floor(minutes / 60)).padStart(2, "0")}:${String(minutes % 60).padStart(2, "0")}`;
}

function buildAttendanceRecords() {
  const activeInternees = INTERNEES.filter((i) => i.status !== "Completed");
  const records = [];
  const today = MOCK_CURRENT_DATE;

  for (let date = ATTENDANCE_WINDOW_START; date <= today; date = isoAddDays(date, 1)) {
    for (const internee of activeInternees) {
      // Weekends are always off — no submission expected, no attendance tracked.
      if (isWeekend(date)) {
        records.push({ id: `ar-${date}-${internee.id}`, date, interneeId: internee.id, status: "off", submissionId: null, submittedAt: null });
        continue;
      }

      const override = ATTENDANCE_OVERRIDES[`${internee.id}|${date}`];
      if (override) {
        records.push({ id: `ar-${date}-${internee.id}`, date, interneeId: internee.id, ...override });
        continue;
      }

      // Today is still in progress: the server finalizes statuses at end of
      // day, so every record for the current date stays pending in the mock.
      if (date === today) {
        records.push({ id: `ar-${date}-${internee.id}`, date, interneeId: internee.id, status: "pending", submissionId: null, submittedAt: null });
        continue;
      }

      const roll = seededRandom(`${internee.id}|${date}`);
      const r1 = seededRandom(`${internee.id}|${date}|t1`);
      const r2 = seededRandom(`${internee.id}|${date}|t2`);
      let status;
      if (roll < 0.8) status = "present";
      else if (roll < 0.88) status = "late";
      else if (roll < 0.95) status = "absent";
      else status = "excused";

      // Historical mock records predate the submissions module, so generated
      // rows carry no linked submission file.
      records.push({
        id: `ar-${date}-${internee.id}`,
        date,
        interneeId: internee.id,
        status,
        submissionId: null,
        submittedAt:
          status === "present"
            ? minutesToHHMM(960 + Math.floor(r1 * 236)) // 16:00 – 19:55
            : status === "late"
              ? minutesToHHMM(1205 + Math.floor(r2 * 216)) // 20:05 – 23:40
              : null,
      });
    }
  }
  return records;
}

export const ATTENDANCE_RECORDS = buildAttendanceRecords();

export function getAttendanceByDate(date) {
  return ATTENDANCE_RECORDS.filter((r) => r.date === date);
}

// Latest weekday whose records the server has finalized (any non-pending,
// non-off row) — the natural default selection for the Daily Attendance view.
export function getLatestFinalizedDate() {
  let latest = null;
  for (const r of ATTENDANCE_RECORDS) {
    if (r.status !== "pending" && r.status !== "off" && (!latest || r.date > latest)) latest = r.date;
  }
  return latest;
}

export const ACTIVITY_LOG = [
  { id: "log-1", actor: "Ayesha Khan", action: "Updated recurring submission deadline to 20:00", timestamp: "2026-08-24 09:12" },
  { id: "log-2", actor: "System", action: "Marked Usman Ghani absent for 2026-08-23 (no submission)", timestamp: "2026-08-23 20:00" },
  { id: "log-3", actor: "Ayesha Khan", action: "Added special deadline for 2026-08-30", timestamp: "2026-08-22 14:30" },
  { id: "log-4", actor: "Ayesha Khan", action: "Created Batch 3", timestamp: "2026-07-15 10:00" },
  { id: "log-5", actor: "System", action: "Generated July monthly report for Batch 1", timestamp: "2026-08-01 08:00" },
];
