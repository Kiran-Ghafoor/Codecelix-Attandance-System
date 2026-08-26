const STATUS_MAP = {
  present: { label: "Present", tone: "green" },
  "on-time": { label: "On time", tone: "green" },
  active: { label: "Active", tone: "green" },
  late: { label: "Late", tone: "amber" },
  pending: { label: "Pending", tone: "amber" },
  warning: { label: "At risk", tone: "amber" },
  absent: { label: "Absent", tone: "red" },
  missing: { label: "Missing", tone: "red" },
  missed: { label: "Missed", tone: "red" },
  excused: { label: "Excused", tone: "blue" },
  off: { label: "Off", tone: "steel" },
  submitted: { label: "Submitted", tone: "green" },
  completed: { label: "Completed", tone: "steel" },
  info: { label: "Info", tone: "blue" },
};

const TONES = {
  green: "bg-emerald-50 text-emerald-700 ring-emerald-600/10",
  amber: "bg-amber-50 text-amber-700 ring-amber-600/10",
  red: "bg-red-50 text-red-700 ring-red-600/10",
  steel: "bg-steel-100 text-steel-600 ring-steel-500/10",
  blue: "bg-sky-50 text-sky-700 ring-sky-600/10",
  brand: "bg-brand-50 text-brand-700 ring-brand-600/10",
};

export default function Badge({ status, tone, children, dot = true }) {
  const cfg = status ? STATUS_MAP[status] : null;
  const resolvedTone = tone || cfg?.tone || "steel";
  const label = children ?? cfg?.label ?? status;

  return (
    <span
      title={typeof label === "string" ? label : undefined}
      className={`inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-[11px] font-semibold ring-1 ring-inset ${TONES[resolvedTone]}`}
    >
      {dot && <span aria-hidden="true" className="h-1.5 w-1.5 rounded-full bg-current opacity-70" />}
      {label}
    </span>
  );
}
