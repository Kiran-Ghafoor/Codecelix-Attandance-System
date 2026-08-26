// ---------------------------------------------------------------------------
// Attendance contract (frontend view only)
//
// The frontend NEVER calculates attendance. The future backend decides each
// internee's daily status by comparing the server-side submission timestamp
// against the deadline configured in Admin > Attendance Settings:
//
//   submitted <= deadline      -> present
//   submitted after deadline   -> late       (same calendar day)
//   no submission              -> absent     (or excused/pending when flagged
//                                            or while review is outstanding)
//
// This module only describes the status vocabulary the UI renders. Any logic
// that derives a status belongs on the server.
// ---------------------------------------------------------------------------

export const ATTENDANCE_STATUSES = ["present", "late", "absent", "excused", "pending", "off"];

export const ATTENDANCE_STATUS_LABELS = {
  present: "Present",
  late: "Late",
  absent: "Absent",
  excused: "Excused",
  pending: "Pending",
  off: "Off",
};
