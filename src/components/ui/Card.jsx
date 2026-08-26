export function Card({ children, className = "", padded = true }) {
  return (
    <div
      className={`rounded-xl border border-steel-200/60 bg-white shadow-card ${padded ? "p-5 sm:p-6" : ""} ${className}`}
    >
      {children}
    </div>
  );
}

export function CardHeader({ title, subtitle, action }) {
  return (
    <div className="mb-4 flex items-start justify-between gap-3">
      <div>
        <h3 className="font-display text-[15px] font-bold tracking-tight text-steel-900">{title}</h3>
        {subtitle && <p className="mt-0.5 text-[13px] text-steel-500">{subtitle}</p>}
      </div>
      {action}
    </div>
  );
}

export function StatCard({ label, value, icon: Icon, tone = "brand", hint }) {
  const tones = {
    brand: { bg: "bg-brand-50", text: "text-brand-600", border: "border-brand-100/80" },
    green: { bg: "bg-emerald-50", text: "text-emerald-600", border: "border-emerald-100/80" },
    amber: { bg: "bg-amber-50", text: "text-amber-600", border: "border-amber-100/80" },
    red: { bg: "bg-red-50", text: "text-red-600", border: "border-red-100/80" },
    steel: { bg: "bg-steel-50", text: "text-steel-500", border: "border-steel-200/80" },
  };
  const t = tones[tone] || tones.brand;
  return (
    <Card className="group transition-shadow duration-200 hover:shadow-card-hover">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-[12px] font-medium text-steel-400">{label}</p>
          <p className="mt-1 font-display text-[26px] font-bold leading-none tracking-tight text-steel-900">{value}</p>
          {hint && <p className="mt-1.5 text-[12px] text-steel-400">{hint}</p>}
        </div>
        {Icon && (
          <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border ${t.bg} ${t.text} ${t.border}`}>
            <Icon className="h-[16px] w-[16px]" strokeWidth={1.8} />
          </div>
        )}
      </div>
    </Card>
  );
}
