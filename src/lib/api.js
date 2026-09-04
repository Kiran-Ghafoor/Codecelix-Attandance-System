// ---------------------------------------------------------------------------
// API utility — single fetch wrapper for all backend calls.
//
// Usage:
//   import { apiRequest } from "../lib/api";
//   const data = await apiRequest("/auth/login", { method: "POST", body: { email, password } });
//
// Env vars:
//   VITE_API_URL  — backend base URL (default: http://localhost:5000/api)
//
// Authentication:
//   The backend authenticates via an httpOnly JWT cookie. The browser sends
//   it automatically because `credentials: "include"` is set on every request.
//   The frontend therefore NEVER stores, reads, or sends a JWT itself.
//
// Backend response contract:
//   Success → { ...data }
//   Error   → { message: string, code?: string }  (e.g. code: "EMAIL_NOT_VERIFIED")
// ---------------------------------------------------------------------------

const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

export const API_BASE_URL = BASE_URL;

/** Browser's timezone offset from UTC in minutes (negative = east of UTC). */
function getTimezoneOffset() {
  return -new Date().getTimezoneOffset();
}

export class ApiError extends Error {
  constructor(status, message, code) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.code = code || null;
  }
}

export async function apiRequest(endpoint, { method = "GET", body, headers = {} } = {}) {
  const url = `${BASE_URL}${endpoint}`;

  const config = {
    method,
    // Always send cookies (httpOnly JWT) so the backend can authenticate
    // the request. Required for cookie-based sessions.
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      "X-Timezone-Offset": String(getTimezoneOffset()),
      ...headers,
    },
  };

  if (body !== undefined) {
    config.body = JSON.stringify(body);
  }

  const res = await fetch(url, config);
  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    throw new ApiError(res.status, data.message || `Request failed (${res.status})`, data.code);
  }

  return data;
}

/**
 * Download a backend-generated binary file (e.g. the monthly Excel workbook or
 * a stored submission PDF) as an authenticated blob. The httpOnly JWT cookie is
 * sent automatically via `credentials: "include"`, then the response is saved
 * client-side.
 */
export async function apiDownload(endpoint) {
  const res = await fetch(`${BASE_URL}${endpoint}`, {
    credentials: "include",
    headers: { "X-Timezone-Offset": String(getTimezoneOffset()) },
  });
  if (!res.ok) {
    let message = `Download failed (${res.status})`;
    try {
      const data = await res.json();
      if (data?.message) message = data.message;
    } catch {
      /* non-JSON error body */
    }
    throw new ApiError(res.status, message, null);
  }
  return res.blob();
}
