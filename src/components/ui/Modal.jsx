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
    <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center sm:p-4">
      <div
        className="absolute inset-0 bg-steel-900/40 backdrop-blur-[2px]"
        onClick={onClose}
        aria-hidden="true"
      />
      <div
        role="dialog"
        aria-modal="true"
        className={`relative flex max-h-[100dvh] w-full flex-col sm:max-h-[calc(100dvh-2rem)] ${sizes[size]}
          rounded-t-2xl border border-steel-200/60 bg-white shadow-popover animate-slide-up sm:rounded-2xl`}
      >
        <div className="flex shrink-0 items-center justify-between border-b border-steel-100 px-5 py-4 sm:px-6">
          <h3 className="min-w-0 font-display text-[15px] font-bold text-steel-900">{title}</h3>
          <button
            onClick={onClose}
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg text-steel-400 transition-colors hover:bg-steel-100 hover:text-steel-600"
            aria-label="Close"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        <div className="overflow-y-auto px-5 py-5 sm:px-6">{children}</div>
        {footer && <div className="flex shrink-0 justify-end gap-2 border-t border-steel-100 px-5 py-4 sm:px-6">{footer}</div>}
      </div>
    </div>
  );
}
