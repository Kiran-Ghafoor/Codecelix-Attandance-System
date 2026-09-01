// ---------------------------------------------------------------------------
// Registration constants — batch code format, domains, validation patterns.
//
// Batch code format:  B{number}-{COURSE}-{YEAR}
// Example:           B12-CODECELIX-2026
// ---------------------------------------------------------------------------

export const BATCH_CODE_REGEX = /^B\d{1,3}-[A-Z]{2,20}-\d{4}$/;

// Fixed set of domains that every batch is created with. Batch creation
// auto-creates exactly these domains, and a registering internee picks one of
// them from a dropdown. Multiple domains can coexist within a single batch.
export const FIXED_DOMAINS = ["UI/UX", "AI", "App Development", "Web Development"];

// CNIC format:  12345-1234567-1  (5 digits – 7 digits – 1 digit)
export const CNIC_REGEX = /^\d{5}-\d{7}-\d$/;

// Pakistani phone:  +92 3XXXXXXXXX  or  03XXXXXXXXX  (10 digits after prefix)
export const PHONE_REGEX = /^(\+92|0)3[0-9]{9}$/;

export function parseBatchCode(code) {
  if (!BATCH_CODE_REGEX.test(code)) return null;
  const [batchPart, course, year] = code.split("-");
  return {
    number: parseInt(batchPart.slice(1), 10),
    course,
    year: parseInt(year, 10),
    raw: code,
  };
}

export function formatBatchCode({ number, course, year }) {
  return `B${number}-${course.toUpperCase()}-${year}`;
}
