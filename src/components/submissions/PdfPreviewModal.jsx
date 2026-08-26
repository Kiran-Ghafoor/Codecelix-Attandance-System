import { useEffect } from "react";
import { FileText, X } from "lucide-react";

// Browser-style PDF viewer mock. No real storage/API — renders placeholder
// pages so admins can review what a submitted document would look like.
export default function PdfPreviewModal({ open, onClose, fileName }) {
  useEffect(() => {
    function onKey(e) {
      if (e.key === "Escape") onClose?.();
    }
    if (open) document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-steel-900/60 backdrop-blur-[2px]"
        onClick={onClose}
        aria-hidden="true"
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-label={`PDF preview — ${fileName}`}
        className="relative flex max-h-[85vh] w-full max-w-3xl flex-col overflow-hidden rounded-xl border border-steel-700 bg-white shadow-popover"
      >
        <div className="flex items-center justify-between gap-3 bg-steel-900 px-4 py-3 text-white">
          <div className="flex min-w-0 items-center gap-2">
            <FileText className="h-4 w-4 shrink-0 text-steel-300" />
            <span className="truncate text-sm font-medium" title={fileName}>
              {fileName}
            </span>
          </div>
          <div className="flex shrink-0 items-center gap-3">
            <span className="hidden text-xs text-steel-400 sm:inline">Page 1 of 3</span>
            <button
              onClick={onClose}
              className="rounded-md p-1 text-steel-300 hover:bg-steel-800 hover:text-white"
              aria-label="Close preview"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>

        <div className="scrollbar-thin flex-1 space-y-5 overflow-y-auto bg-steel-200/70 p-4 sm:p-6">
          {/* Placeholder pages — stand-ins until real file storage exists */}
          <MockPage variant="text" />
          <MockPage variant="table" />
          <MockPage variant="signature" />
          <p className="pb-2 text-center text-xs text-steel-400">
            Mock preview — real file rendering will be served by storage once connected.
          </p>
        </div>
      </div>
    </div>
  );
}

const PARAGRAPH_WIDTHS = ["100%", "96%", "98%", "92%", "100%", "84%"];

function MockPage({ variant }) {
  return (
    <div className="mx-auto w-full max-w-[620px] rounded-md bg-white p-6 shadow-card sm:p-8">
      <div className="mb-6 flex items-center justify-between">
        <span className="h-3 w-24 rounded-full bg-brand-200" />
        <span className="text-[10px] font-semibold uppercase tracking-wide text-steel-300">CodeCelix · Mock preview</span>
      </div>

      {variant === "text" && (
        <>
          <div className="mb-5 h-4 w-1/2 rounded-sm bg-steel-700/70" />
          <div className="space-y-2.5">
            {PARAGRAPH_WIDTHS.map((w, i) => (
              <div key={i} className="h-2 rounded-full bg-steel-100" style={{ width: w }} />
            ))}
          </div>
          <div className="mb-3 mt-7 h-3 w-1/3 rounded-sm bg-steel-400" />
          <div className="space-y-2.5">
            {PARAGRAPH_WIDTHS.slice(0, 4).map((w, i) => (
              <div key={i} className="h-2 rounded-full bg-steel-100" style={{ width: w }} />
            ))}
          </div>
        </>
      )}

      {variant === "table" && (
        <>
          <div className="mb-5 h-4 w-2/5 rounded-sm bg-steel-700/70" />
          <div className="grid grid-cols-3 gap-x-4 gap-y-2.5">
            {[0, 1, 2].map((i) => (
              <div key={`h-${i}`} className="h-2.5 rounded-full bg-steel-300" />
            ))}
            {Array.from({ length: 12 }).map((_, i) => (
              <div key={i} className="h-2 rounded-full bg-steel-100" style={{ width: `${88 + ((i * 7) % 12)}%` }} />
            ))}
          </div>
        </>
      )}

      {variant === "signature" && (
        <>
          <div className="space-y-2.5">
            {PARAGRAPH_WIDTHS.slice(1, 5).map((w, i) => (
              <div key={i} className="h-2 rounded-full bg-steel-100" style={{ width: w }} />
            ))}
          </div>
          <div className="mt-10 flex items-end justify-between">
            <div>
              <div className="h-8 w-40 border-b border-steel-300" />
              <p className="mt-2 text-[10px] uppercase tracking-wide text-steel-400">Internee signature</p>
            </div>
            <div>
              <div className="h-8 w-40 border-b border-steel-300" />
              <p className="mt-2 text-[10px] uppercase tracking-wide text-steel-400">Team leader</p>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
