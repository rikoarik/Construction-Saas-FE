import type { operations, components } from "./schema";
import { ApiError, csrfToken } from "./session";
import { platformGet } from "./platform-dashboard";

export type Company = operations["getPlatformCompany"]["responses"][200]["content"]["application/json"];
export type CompanyPage = operations["listPlatformCompanies"]["responses"][200]["content"]["application/json"];
export type CompanyFilters = NonNullable<operations["listPlatformCompanies"]["parameters"]["query"]>;
export type CompanyUsage = operations["getPlatformCompanyUsage"]["responses"][200]["content"]["application/json"];
export type CompanyAdmins = operations["getPlatformCompanyAdmins"]["responses"][200]["content"]["application/json"];
export type Admin = CompanyAdmins["members"][number];
export type Invitation = CompanyAdmins["invitations"][number];
// The OpenAPI allOf + additionalProperties:false combination generates an impossible
// Record<string, never>; preserve the documented required fields explicitly.
export type CreateCompany = components["schemas"]["CompanyEditable"] & { code: string; name: string; admin_email: string };
export type UpdateCompany = operations["updatePlatformCompany"]["requestBody"]["content"]["application/json"];

export const companyList = (filters: CompanyFilters, signal?: AbortSignal) => platformGet<CompanyPage>(`companies?${new URLSearchParams(Object.entries(filters).filter(([, v]) => v !== undefined && v !== "").map(([k, v]) => [k, String(v)])).toString()}`, signal);
export const companyDetail = (id: string, signal?: AbortSignal) => platformGet<Company>(`companies/${encodeURIComponent(id)}`, signal);
export const companyUsage = (id: string, signal?: AbortSignal) => platformGet<CompanyUsage>(`companies/${encodeURIComponent(id)}/usage`, signal);
export const companyAdmins = (id: string, signal?: AbortSignal) => platformGet<CompanyAdmins>(`companies/${encodeURIComponent(id)}/members`, signal);

/** Session cookie and fresh CSRF token are sent only to the same-origin Go proxy. */
async function write<T>(path: string, method: "POST" | "PATCH" | "DELETE", expected: number, body?: unknown, key?: string): Promise<T> {
  const token = await csrfToken();
  let response: Response;
  try {
    response = await fetch(`/api/v1/platform/${path}`, {
      method, credentials: "same-origin", cache: "no-store", redirect: "error",
      headers: { "X-CSRF-Token": token, ...(body === undefined ? {} : { "Content-Type": "application/json" }), ...(key ? { "Idempotency-Key": key } : {}) },
      ...(body === undefined ? {} : { body: JSON.stringify(body) }),
    });
  } catch { throw new ApiError("network"); }
  if (response.status !== expected) {
    // Only allowlisted business codes are consumed; never expose raw server text.
    let code: string | undefined;
    try { const data = await response.json(); if (typeof data?.code === "string") code = data.code; } catch { /* no response body */ }
    throw new CompanyApiError(response.status, code);
  }
  if (expected === 204) return undefined as T;
  try { return await response.json() as T; } catch { throw new ApiError("invalid_response"); }
}
export class CompanyApiError extends ApiError {
  constructor(status: number, public readonly code?: string) { super("response", status); }
}
export const createCompany = (body: CreateCompany, key: string) => write<Company>("companies", "POST", 201, body, key);
export const updateCompany = (id: string, body: UpdateCompany) => write<Company>(`companies/${encodeURIComponent(id)}`, "PATCH", 200, body);
export const changeCompanyStatus = (id: string, action: "suspend" | "reactivate", reason?: string) => write<Company>(`companies/${encodeURIComponent(id)}/${action}`, "POST", 200, action === "suspend" ? { reason } : undefined);
export const inviteAdmin = (id: string, email: string) => write<Invitation>(`companies/${encodeURIComponent(id)}/invitations`, "POST", 201, { email });
export const resendInvitation = (id: string, invitationId: string) => write<Invitation>(`companies/${encodeURIComponent(id)}/invitations/${encodeURIComponent(invitationId)}/resend`, "POST", 200);
export const cancelInvitation = (id: string, invitationId: string) => write<void>(`companies/${encodeURIComponent(id)}/invitations/${encodeURIComponent(invitationId)}`, "DELETE", 204);
export const setAdminStatus = (id: string, userId: string, status: "active" | "suspended") => write<Admin>(`companies/${encodeURIComponent(id)}/members/${encodeURIComponent(userId)}`, "PATCH", 200, { status });
