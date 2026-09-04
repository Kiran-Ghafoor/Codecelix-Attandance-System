export default function DetailRow({ label, children }) {
  return (
    <div className="flex items-center justify-between gap-4 px-4 py-2.5 sm:flex-wrap">
      <span className="min-w-0 shrink-0 text-[13px] text-steel-500">{label}</span>
      <span className="min-w-0 text-right text-[13px] font-medium text-steel-800">{children}</span>
    </div>
  );
}
