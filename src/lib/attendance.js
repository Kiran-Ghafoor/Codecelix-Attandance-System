// ---------------------------------------------------------------------------
// Attendance contract (frontend view only)
//
// The frontend NEVER calculates attendance. The backend decides each
// internee's daily status by comparing the server-side submission timestamp
// against the deadline configured in Admin > Attendance Settings:
//
//   submitted before/at deadline -> present  (submissions close at the deadline)
//   submitted after deadline     -> rejected (submissions are closed)
//   no submission                -> absent   (finalized after the day ends)
//   Saturday/Sunday              -> off      (no submission expected)
//
// Attendance is binary — present or absent. There is no "late" or "excused".
// This module only describes the status vocabulary the UI renders. Any logic
// that derives a status belongs on the server.
// ---------------------------------------------------------------------------

export const ATTENDANCE_STATUSES = ["present", "absent", "pending", "off"];

export const ATTENDANCE_STATUS_LABELS = {
  present: "Present",
  absent: "Absent",
  pending: "Pending",
  off: "Off",
};
