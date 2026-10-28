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

export type LoginNext = "authenticated" | "mfa_required" | "mfa_enrollment_required";

async function mutate(path: string, body?: unknown): Promise<Response> {
  const token = await csrfToken();
  return request(path, {
    method: "POST",
    headers: { "X-CSRF-Token": token, ...(body === undefined ? {} : { "Content-Type": "application/json" }) },
    ...(body === undefined ? {} : { body: JSON.stringify(body) }),
  });
}

export async function login(input: LoginInput): Promise<LoginNext> {
  const response = await mutate("/auth/login", input);
  let body: { next?: unknown };
  try { body = await response.json(); } catch { throw new ApiError("invalid_response"); }
  if (response.status !== 200 || !body || !["authenticated", "mfa_required", "mfa_enrollment_required"].includes(String(body.next))) throw new ApiError("invalid_response");
  return body.next as LoginNext;
}

export async function startEnrollment(): Promise<{ secret: string; otpauth_url: string }> {
  const response = await mutate("/auth/mfa/enrollment");
  let body: { secret?: unknown; otpauth_url?: unknown };
  try { body = await response.json(); } catch { throw new ApiError("invalid_response"); }
  if (!body || typeof body.secret !== "string" || typeof body.otpauth_url !== "string") throw new ApiError("invalid_response");
  return { secret: body.secret, otpauth_url: body.otpauth_url };
}

export async function verifyMFA(mode: "enrollment/confirm" | "challenge" | "recovery", code: string): Promise<string[]> {
  const response = await mutate(`/auth/mfa/${mode}`, { code });
  let body: { expires_at?: unknown; recovery_codes?: unknown };
  try { body = await response.json(); } catch { throw new ApiError("invalid_response"); }
  if (!body || typeof body.expires_at !== "string" || (body.recovery_codes !== undefined && (!Array.isArray(body.recovery_codes) || !body.recovery_codes.every((v: unknown) => typeof v === "string")))) throw new ApiError("invalid_response");
  return (body.recovery_codes ?? []) as string[];
}

export async function forgotPassword(email: string): Promise<void> {
  const response = await mutate("/auth/forgot-password", { email });
  if (response.status !== 202) throw new ApiError("invalid_response");
}

export async function submitEmailLink(kind: "reset-password" | "verify-email" | "invitations/accept", token: string, password?: string): Promise<void> {
  const body = kind === "reset-password" ? { token, new_password: password } : kind === "invitations/accept" ? { token, password: password ?? "" } : { token };
  const response = await mutate(`/auth/${kind}`, body);
  if (response.status !== (kind === "invitations/accept" ? 200 : 204)) throw new ApiError("invalid_response");
}

/** Determine whether the authenticated user has a current platform-wide grant. */
export async function isPlatformAdmin(): Promise<boolean> {
  try {
    const response = await request("/platform/session");
    let body: { authenticated?: unknown; mfa_verified?: unknown; capabilities?: unknown };
    try { body = await response.json(); } catch { throw new ApiError("invalid_response"); }
    if (!body || body.authenticated !== true || body.mfa_verified !== true || !Array.isArray(body.capabilities) || !body.capabilities.includes("platform.access")) throw new ApiError("invalid_response");
    return true;
  } catch (error) {
    if (error instanceof ApiError && error.status === 403) return false;
    throw error;
  }
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
