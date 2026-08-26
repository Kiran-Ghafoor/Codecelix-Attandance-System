export default function DetailRow({ label, children }) {
  return (
    <div className="flex items-center justify-between gap-4 px-4 py-2.5">
      <span className="text-[13px] text-steel-500">{label}</span>
      <span className="text-right text-[13px] font-medium text-steel-800">{children}</span>
    </div>
  );
}
