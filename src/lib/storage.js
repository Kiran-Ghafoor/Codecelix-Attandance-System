// ---------------------------------------------------------------------------
// Submitted-document storage contract (frontend view only)
//
// Future flow — implemented entirely by the backend:
//   1. Internee uploads a PDF from this app
//   2. Backend receives the file and uploads it to Google Drive
//      (service-account / OAuth credentials live ONLY on the server)
//   3. Backend persists the Drive file ID + document metadata in MongoDB
//   4. Backend returns opaque metadata to the frontend:
//        fileName · fileType · fileSize · submittedAt ·
//        storageFileId · viewUrl · downloadUrl
//
// Security posture (enforced by keeping this the ONLY storage-aware module):
//   - No Google Drive folder IDs, credentials or API keys exist anywhere in
//     frontend code — the backend owns all of it.
//   - `storageFileId` is an opaque token minted by the backend; the UI never
//     parses it or derives storage locations from it.
//   - `viewUrl` / `downloadUrl` are backend-issued URLs (short-lived/signed
//     once real) consumed verbatim as hrefs.
//
// Until that API exists, getStoredDocument() fabricates deterministic mock
// values flagged with `isMock`. UI components stay provider-agnostic: they
// render whatever IDs/URLs this module hands them and never learn where the
// files physically live.
// ---------------------------------------------------------------------------

const FILE_TYPE_PDF = "application/pdf";

// Deterministic stand-in so every render/session shows the same ID for the
// same submission. The "drv_mock_" prefix keeps demo data clearly distinct
// from real Google Drive file IDs.
function mockStorageFileId(submissionId) {
  let hash = 2166136261;
  const key = `codecelix-mock-storage|${submissionId}`;
  for (let i = 0; i < key.length; i++) {
    hash ^= key.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }
  return `drv_mock_${(hash >>> 0).toString(16).padStart(8, "0")}`;
}

/**
 * Maps a raw submission record onto the document descriptor the future
 * backend will return for uploaded files. Returns null for non-file
 * submissions (e.g. GitHub-only) — those carry no stored document.
 */
export function getStoredDocument(submission) {
  if (!submission?.fileName) return null;
  const storageFileId = mockStorageFileId(submission.id);
  return {
    fileName: submission.fileName,
    fileType: FILE_TYPE_PDF,
    fileSize: submission.fileSizeBytes ?? 0,
    submittedAt: `${submission.date}T${submission.submittedAt ?? "00:00"}:00`,
    storageFileId,
    // Mock hash-routes today; swapped for signed backend URLs tomorrow.
    viewUrl: `#/mock-storage/${storageFileId}/view`,
    downloadUrl: `#/mock-storage/${storageFileId}/download`,
    isMock: true,
  };
}

// Deliberately provider-agnostic copy for the UI; storage specifics stay in
// this module and on the server.
export const STORAGE_PROVIDER_LABEL = "Secure cloud storage";

export const STORAGE_MOCK_DOWNLOAD_NOTICE =
  "Downloads are disabled in this preview — once connected, the backend serves the file directly from secure cloud storage.";
