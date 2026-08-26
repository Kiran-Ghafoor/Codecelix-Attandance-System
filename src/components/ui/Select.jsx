import { ChevronDown } from "lucide-react";

export default function Select({ label, options, className = "", id, name, ...props }) {
  const selectId = id || name;
  return (
    <div className="w-full">
      {label && (
        <label htmlFor={selectId} className="mb-1.5 block text-[13px] font-medium text-steel-700">
          {label}
        </label>
      )}
      <div className="relative">
        <select
          id={selectId}
          name={name}
          className={`h-10 w-full appearance-none rounded-lg border border-steel-200 bg-white pl-3 pr-9 text-[14px]
            text-steel-900 transition-all duration-150 hover:border-steel-300 focus:border-brand-400 focus:outline-none
            focus:ring-2 focus:ring-brand-50/80 ${className}`}
          {...props}
        >
          {options.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
        <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-steel-400" />
      </div>
    </div>
  );
}
