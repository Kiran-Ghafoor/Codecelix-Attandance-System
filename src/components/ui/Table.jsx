export function Table({ children }) {
  return (
    <div className="overflow-x-auto rounded-xl border border-steel-200/60 bg-white">
      <table className="w-full min-w-[560px] border-collapse text-left text-[13px]">{children}</table>
    </div>
  );
}

export function THead({ columns }) {
  return (
    <thead>
      <tr className="border-b border-steel-200/60 bg-steel-50">
        {columns.map((col) => (
          <th
            key={col}
            className="whitespace-nowrap px-4 py-2.5 text-[11px] font-semibold uppercase tracking-wider text-steel-400"
          >
            {col}
          </th>
        ))}
      </tr>
    </thead>
  );
}

export function TRow({ children, className = "" }) {
  return (
    <tr className={`border-b border-steel-100/60 last:border-0 transition-colors hover:bg-steel-50/60 ${className}`}>
      {children}
    </tr>
  );
}

export function TCell({ children, className = "" }) {
  return <td className={`whitespace-nowrap px-4 py-3 text-steel-600 ${className}`}>{children}</td>;
}
