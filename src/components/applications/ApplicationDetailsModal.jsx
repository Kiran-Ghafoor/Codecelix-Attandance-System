import { useState } from "react";
import { CheckCircle2, XCircle, Mail, Phone, CreditCard, BookOpen, CalendarDays, ShieldCheck, AlertTriangle, Eye, EyeOff } from "lucide-react";
import Modal from "../ui/Modal";
import Button from "../ui/Button";
import Badge from "../ui/Badge";
import Textarea from "../ui/Textarea";
import DetailRow from "../ui/DetailRow";
import { AVAILABLE_DOMAINS } from "../../lib/registration";
import { formatDate } from "../../lib/format";

function maskCnic(cnic) {
  if (!cnic) return "\u2014";
  const parts = cnic.split("-");
  if (parts.length !== 3) return cnic;
  return `${"*".repeat(parts[0].length)}-${"*".repeat(parts[1].length)}-${parts[2]}`;
}

function domainLabel(value) {
  return AVAILABLE_DOMAINS.find((d) => d.value === value)?.label ?? value;
}

export default function ApplicationDetailsModal({ open, application, onClose, onApprove, onReject }) {
  const [action, setAction] = useState(null); // "approve" | "reject" | null
  const [reason, setReason] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [showCnic, setShowCnic] = useState(false);

  if (!application) return null;

  const isPending = application.status === "pending";

  async function handleApprove() {
    setSubmitting(true);
    try {
      await onApprove(application.id);
      handleClose();
    } finally {
      setSubmitting(false);
    }
  }

  async function handleReject() {
    setSubmitting(true);
    try {
      await onReject(application.id, reason.trim());
      handleClose();
    } finally {
      setSubmitting(false);
    }
  }

  function handleClose() {
    setAction(null);
    setReason("");
    onClose();
  }

  function handleActionClick(type) {
    setAction(type);
    setReason("");
    setShowCnic(false);
  }

  return (
    <Modal open={open} onClose={handleClose} title="Application details" size="lg">
      <div className="space-y-5">
        {/* Header */}
        <div className="flex items-start justify-between gap-4">
          <div>
            <h4 className="font-display text-[15px] font-bold text-steel-900">{application.name}</h4>
            <p className="mt-0.5 text-[13px] text-steel-500">{application.email}</p>
          </div>
          <Badge status={application.status} />
        </div>

        {/* Details */}
        <div className="rounded-xl border border-steel-100 divide-y divide-steel-100">
          <DetailRow label="Full name">{application.name}</DetailRow>
          <DetailRow label="Email">
            <span className="inline-flex items-center gap-1.5">
              <Mail className="h-3.5 w-3.5 text-steel-400" />
              {application.email}
            </span>
          </DetailRow>
          <DetailRow label="CNIC">
            <span className="inline-flex items-center gap-1.5">
              <span className={showCnic ? "" : "font-mono"}>{showCnic ? application.cnic : maskCnic(application.cnic)}</span>
              <button
                type="button"
                onClick={() => setShowCnic((v) => !v)}
                className="text-steel-400 transition-colors hover:text-steel-600"
                title={showCnic ? "Hide CNIC" : "Show CNIC"}
              >
                {showCnic ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
              </button>
            </span>
          </DetailRow>
          <DetailRow label="Contact">
            <span className="inline-flex items-center gap-1.5">
              <Phone className="h-3.5 w-3.5 text-steel-400" />
              {application.phone}
            </span>
          </DetailRow>
          <DetailRow label="Batch code">
            <span className="inline-flex items-center gap-1.5">
              <BookOpen className="h-3.5 w-3.5 text-steel-400" />
              {application.batchCode}
            </span>
          </DetailRow>
          <DetailRow label="Domain">{domainLabel(application.domain)}</DetailRow>
          <DetailRow label="Registered">
            <span className="inline-flex items-center gap-1.5">
              <CalendarDays className="h-3.5 w-3.5 text-steel-400" />
              {formatDate(application.createdAt)}
            </span>
          </DetailRow>
          <DetailRow label="Email verified">
            <span className="inline-flex items-center gap-1.5">
              <ShieldCheck className="h-3.5 w-3.5 text-steel-400" />
              {application.emailVerified ? (
                <span className="text-green-600 font-medium">Yes</span>
              ) : (
                <span className="text-amber-600 font-medium">No</span>
              )}
            </span>
          </DetailRow>
          {application.reviewedAt && (
            <DetailRow label="Reviewed on">{formatDate(application.reviewedAt)}</DetailRow>
          )}
          {application.reviewedBy && (
            <DetailRow label="Reviewed by">{application.reviewedBy}</DetailRow>
          )}
          {application.rejectionReason && (
            <DetailRow label="Rejection reason">
              <span className="text-red-600 max-w-[240px] text-right">{application.rejectionReason}</span>
            </DetailRow>
          )}
        </div>

        {/* Pending action buttons */}
        {isPending && !action && (
          <div className="flex gap-3">
            <Button
              variant="danger"
              icon={XCircle}
              className="flex-1"
              onClick={() => handleActionClick("reject")}
            >
              Reject
            </Button>
            <Button
              variant="primary"
              icon={CheckCircle2}
              className="flex-1"
              onClick={() => handleActionClick("approve")}
            >
              Approve
            </Button>
          </div>
        )}

        {/* Approve confirmation */}
        {action === "approve" && (
          <div className="rounded-xl border border-green-200 bg-green-50 p-4 space-y-3">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5 text-green-600" />
              <p className="text-[13px] font-medium text-green-800">Approve this application?</p>
            </div>
            <p className="text-[12px] text-green-700">
              {application.name} will be granted internee access and can log in to the system.
            </p>
            <div className="flex gap-2 pt-1">
              <Button variant="ghost" size="sm" onClick={() => setAction(null)}>
                Cancel
              </Button>
              <Button size="sm" loading={submitting} onClick={handleApprove}>
                Confirm approve
              </Button>
            </div>
          </div>
        )}

        {/* Reject form */}
        {action === "reject" && (
          <div className="rounded-xl border border-red-200 bg-red-50 p-4 space-y-3">
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-red-600" />
              <p className="text-[13px] font-medium text-red-800">Reject this application?</p>
            </div>
            <Textarea
              label="Rejection reason (optional)"
              placeholder="e.g. Invalid CNIC, documents missing, duplicate account..."
              rows={3}
              value={reason}
              onChange={(e) => setReason(e.target.value)}
            />
            <div className="flex gap-2 pt-1">
              <Button variant="ghost" size="sm" onClick={() => setAction(null)}>
                Cancel
              </Button>
              <Button variant="danger" size="sm" loading={submitting} onClick={handleReject}>
                Confirm reject
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Footer — only close when not in action mode */}
      {!action && (
        <div className="mt-5 flex justify-end border-t border-steel-100 pt-4">
          <Button variant="ghost" onClick={handleClose}>
            Close
          </Button>
        </div>
      )}
    </Modal>
  );
}
