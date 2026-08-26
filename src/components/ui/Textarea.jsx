export default function Textarea({ label, error, className = "", id, rows = 3, ...props }) {
  const inputId = id || props.name;
  return (
    <div className="w-full">
      {label && (
        <label htmlFor={inputId} className="mb-1.5 block text-[13px] font-medium text-steel-700">
          {label}
        </label>
      )}
      <textarea
        id={inputId}
        rows={rows}
        className={`w-full rounded-lg border bg-white px-3 py-2 text-[14px] text-steel-900 placeholder:text-steel-400
          transition-all duration-150 focus:border-brand-400 focus:outline-none focus:ring-2 focus:ring-brand-50/80
          ${error ? "border-red-300 focus:border-red-400 focus:ring-red-50" : "border-steel-200 hover:border-steel-300"}
          ${className}`}
        {...props}
      />
      {error && <p className="mt-1.5 text-[12px] text-red-600">{error}</p>}
    </div>
  );
}
