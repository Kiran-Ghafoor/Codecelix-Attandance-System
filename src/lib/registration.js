// ---------------------------------------------------------------------------
// Registration constants — batch code format, domains, validation patterns.
//
// Batch code format:  B{number}-{COURSE}-{YEAR}
// Example:           B12-COURSERA-2026
// ---------------------------------------------------------------------------

export const BATCH_CODE_REGEX = /^B\d{1,3}-[A-Z]{2,20}-\d{4}$/;

export const AVAILABLE_DOMAINS = [
  { value: "ai", label: "Artificial Intelligence" },
  { value: "web", label: "Web Development" },
  { value: "cyber", label: "Cyber Security" },
  { value: "mobile", label: "Mobile Development" },
  { value: "data", label: "Data Science" },
  { value: "cloud", label: "Cloud Computing" },
  { value: "devops", label: "DevOps" },
  { value: "uiux", label: "UI/UX Design" },
];

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
