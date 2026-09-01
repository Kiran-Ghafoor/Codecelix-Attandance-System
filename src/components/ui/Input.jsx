export default function Input({ label, error, icon: Icon, className = "", id, required, ...props }) {
  const inputId = id || props.name;
  return (
    <div className="w-full">
      {label && (
        <label htmlFor={inputId} className="mb-1.5 block text-[13px] font-medium text-steel-700">
          {label}
          {required && <span className="ml-0.5 text-red-500">*</span>}
        </label>
      )}
      <div className="relative">
        {Icon && (
          <Icon className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-steel-400" />
        )}
        <input
          id={inputId}
          className={`h-10 w-full rounded-lg border bg-white px-3 text-[14px] text-steel-900 placeholder:text-steel-400
            transition-all duration-150 focus:border-brand-400 focus:outline-none focus:ring-2 focus:ring-brand-50/80
            ${Icon ? "pl-9" : "pl-3"} pr-3
            ${error ? "border-red-300 focus:border-red-400 focus:ring-red-50" : "border-steel-200 hover:border-steel-300"}
            ${className}`}
          {...props}
        />
      </div>
      {error && <p className="mt-1.5 text-[12px] text-red-600">{error}</p>}
    </div>
  );
}
