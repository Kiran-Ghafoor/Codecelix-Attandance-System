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
// Backend response contract:
//   Success → { ...data }
//   Error   → { message: string, code?: string }  (e.g. code: "EMAIL_NOT_VERIFIED")
// ---------------------------------------------------------------------------

const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

export class ApiError extends Error {
  constructor(status, message, code) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.code = code || null;
  }
}

export async function apiRequest(endpoint, { method = "GET", body, headers = {}, token } = {}) {
  const url = `${BASE_URL}${endpoint}`;

  const config = {
    method,
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      ...headers,
    },
  };

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

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
