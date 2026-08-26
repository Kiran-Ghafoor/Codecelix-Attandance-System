import { ChevronDown } from "lucide-react";
import Select from "./Select";

const HOURS = Array.from({ length: 12 }, (_, i) => i + 1);
const MINUTES = Array.from({ length: 60 }, (_, i) => String(i).padStart(2, "0"));
const PERIODS = ["AM", "PM"];

function parse(value) {
  const [h, m] = String(value ?? "").split(":");
  const hour24 = Number.parseInt(h, 10);
  if (Number.isNaN(hour24)) return { hour: 11, minute: "59", period: "PM" };
  return {
    hour: hour24 % 12 === 0 ? 12 : hour24 % 12,
    minute: (m ?? "00").padStart(2, "0"),
    period: hour24 >= 12 ? "PM" : "AM",
  };
}

export default function TimePicker({ value, onChange, disabled = false }) {
  const { hour, minute, period } = parse(value);

  function emit(nextHour, nextMinute, nextPeriod) {
    const h24 = nextPeriod === "PM" ? (nextHour % 12) + 12 : nextHour % 12;
    onChange?.(`${String(h24).padStart(2, "0")}:${nextMinute}`);
  }

  return (
    <div className={`grid grid-cols-[1fr_1fr_auto] gap-2 ${disabled ? "opacity-60" : ""}`}>
      <Select
        aria-label="Hour"
        disabled={disabled}
        options={HOURS.map((h) => ({ value: h, label: h }))}
        value={hour}
        onChange={(e) => emit(Number(e.target.value), minute, period)}
      />
      <div className="relative">
        <select
          aria-label="Minute"
          disabled={disabled}
          value={minute}
          onChange={(e) => emit(hour, e.target.value, period)}
          className="h-10 w-full appearance-none rounded-lg border border-steel-200 bg-white pl-3 pr-9 text-[14px]
            text-steel-900 transition-all duration-150 hover:border-steel-300 focus:border-brand-400 focus:outline-none
            focus:ring-2 focus:ring-brand-50 disabled:cursor-not-allowed"
        >
          {MINUTES.map((m) => (
            <option key={m} value={m}>
              {m}
            </option>
          ))}
        </select>
        <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-steel-400" />
      </div>
      <div className="flex h-10 overflow-hidden rounded-lg border border-steel-200">
        {PERIODS.map((p) => (
          <button
            key={p}
            type="button"
            disabled={disabled}
            aria-pressed={period === p}
            onClick={() => emit(hour, minute, p)}
            className={`w-11 text-[13px] font-medium transition-all duration-150 disabled:cursor-not-allowed ${
              period === p ? "bg-brand-600 text-white shadow-xs shadow-brand-600/20" : "bg-white text-steel-500 hover:bg-steel-50"
            }`}
          >
            {p}
          </button>
        ))}
      </div>
    </div>
  );
}
