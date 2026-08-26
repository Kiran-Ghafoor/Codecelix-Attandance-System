// Mobile-number validation for internee onboarding.
//
// Accepted formats (spaces/dashes are cosmetic and ignored):
//   03001234567        — local mobile, 11 digits, network code starts with 03
//   0300-1234567       — same, dashed
//   +92 300 1234567    — international, exactly 10 digits after +92 starting with 3

export function normalizePhone(value) {
  return String(value ?? "").replace(/[\s-]/g, "");
}

/**
 * Human-readable error message for a mobile number, or null when valid.
 * Bare digit runs like "1234567890" or truncated "0300123456" are rejected —
 * the number must carry a real network prefix.
 */
export function getPhoneError(value) {
  const digits = normalizePhone(value);
  if (!digits) return "Phone number is required.";
  if (digits.startsWith("+92")) {
    const rest = digits.slice(3);
    if (!/^3\d{9}$/.test(rest)) {
      return "After +92, enter the 10-digit mobile number starting with 3 (e.g. +92 300 1234567).";
    }
    return null;
  }
  if (/^03\d{9}$/.test(digits)) return null;
  return "Enter a valid mobile number, e.g. 0300-1234567 or +92 300 1234567.";
}
