import { X } from "lucide-react";
import { useEffect } from "react";

export default function Modal({ open, onClose, title, children, footer, size = "md" }) {
  useEffect(() => {
    function onKey(e) {
      if (e.key === "Escape") onClose?.();
    }
    if (open) document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open) return null;

  const sizes = { sm: "max-w-sm", md: "max-w-md", lg: "max-w-lg", xl: "max-w-2xl" };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-steel-900/40 backdrop-blur-[2px]"
        onClick={onClose}
        aria-hidden="true"
      />
      <div
        role="dialog"
        aria-modal="true"
        className={`relative w-full ${sizes[size]} rounded-2xl border border-steel-200/60 bg-white shadow-popover animate-fade-in`}
      >
        <div className="flex items-center justify-between border-b border-steel-100 px-6 py-4">
          <h3 className="font-display text-[15px] font-bold text-steel-900">{title}</h3>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-steel-400 transition-colors hover:bg-steel-100 hover:text-steel-600"
            aria-label="Close"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
        <div className="px-6 py-5">{children}</div>
        {footer && <div className="flex justify-end gap-2 border-t border-steel-100 px-6 py-4">{footer}</div>}
      </div>
    </div>
  );
}
