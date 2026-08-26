export default function EmptyState({ icon: Icon, title, description, action }) {
  return (
    <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-steel-200/80 bg-steel-50/30 px-6 py-14 text-center">
      {Icon && (
        <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-full bg-white shadow-xs ring-1 ring-steel-200/50">
          <Icon className="h-5 w-5 text-steel-400" strokeWidth={1.5} />
        </div>
      )}
      <p className="font-display text-[14px] font-semibold text-steel-700">{title}</p>
      {description && <p className="mt-1 max-w-sm text-[13px] leading-relaxed text-steel-500">{description}</p>}
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}
