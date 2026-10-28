import type { operations } from "./schema";

export type LoginInput = operations["login"]["requestBody"]["content"]["application/json"];
type CsrfResponse = operations["getCsrfToken"]["responses"][200]["content"]["application/json"];

/** Status only: never expose backend response text or submitted credentials. */
export class ApiError extends Error {
  constructor(public readonly kind: "network" | "response" | "invalid_response", public readonly status?: number) {
    super("API request failed");
    this.name = "ApiError";
  }
}

async function request(path: string, init: RequestInit = {}): Promise<Response> {
  let response: Response;
  try {
    response = await fetch(`/api/v1${path}`, {
      ...init,
      credentials: "same-origin",
      cache: "no-store",
      redirect: "error",
    });
  } catch {
    throw new ApiError("network");
  }
  if (!response.ok) throw new ApiError("response", response.status);
  return response;
}

async function csrfToken(): Promise<string> {
  const response = await request("/auth/csrf");
  let body: Partial<CsrfResponse>;
  try {
    body = await response.json();
  } catch {
    throw new ApiError("invalid_response");
  }
  if (!body || typeof body.csrf_token !== "string" || body.csrf_token.length < 32) {
    throw new ApiError("invalid_response");
  }
  return body.csrf_token;
}

/** Public login uses the server's origin checks rather than a session CSRF token. */
export async function login(input: LoginInput): Promise<void> {
  const response = await request("/auth/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });
  if (response.status !== 204) throw new ApiError("invalid_response");
}

/** Obtain a fresh session-bound token; never persist or reuse it across sessions. */
export async function logout(): Promise<void> {
  const token = await csrfToken();
  const response = await request("/auth/logout", {
    method: "POST",
    headers: { "X-CSRF-Token": token },
  });
  if (response.status !== 204) throw new ApiError("invalid_response");
}

