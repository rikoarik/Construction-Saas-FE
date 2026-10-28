import type { operations } from "./schema";
import { ApiError, csrfToken } from "./session";

export type Operator = operations["getPlatformDashboardOperator"]["responses"][200]["content"]["application/json"];
export type Dashboard = operations["getPlatformDashboard"]["responses"][200]["content"]["application/json"];
export type Growth = operations["getPlatformCompanyGrowth"]["responses"][200]["content"]["application/json"];
export type CompanyStatus = operations["getPlatformCompanyStatus"]["responses"][200]["content"]["application/json"];
export type Activities = operations["getPlatformActivities"]["responses"][200]["content"]["application/json"];
type ManagedCompanies = operations["listPlatformCompanies"]["responses"][200]["content"]["application/json"];
/** Dashboard consumes a metadata projection; the API response includes additional management fields. */
export type Companies = Omit<ManagedCompanies, "items" | "total"> & { total?: number; items: Array<Pick<ManagedCompanies["items"][number], "id" | "name" | "status" | "subscription_plan" | "member_count" | "created_at"> & { project_count: number | null }> };
export type Jobs = operations["listPlatformDashboardJobs"]["responses"][200]["content"]["application/json"];
export type Distribution = operations["getPlatformSubscriptionDistribution"]["responses"][200]["content"]["application/json"];
export type Storage = operations["getPlatformStorageUsage"]["responses"][200]["content"]["application/json"];
export type Integrations = operations["getPlatformIntegrationHealth"]["responses"][200]["content"]["application/json"];
export type Notifications = operations["listPlatformNotifications"]["responses"][200]["content"]["application/json"];
export type NotificationItem = Notifications["items"][number];
export type Range = NonNullable<operations["getPlatformDashboard"]["parameters"]["query"]>["range"];
export type NotificationTypeFilter = NonNullable<NonNullable<operations["listPlatformNotifications"]["parameters"]["query"]>["type"]>;
export type NotificationReadFilter = NonNullable<NonNullable<operations["listPlatformNotifications"]["parameters"]["query"]>["read"]>;

export const notificationTypes = ["", "process", "company", "subscription"] as const;
export const notificationReads = ["", "unread", "read"] as const;

export const ranges = ["7d", "30d", "90d", "12m"] as const;
export function isRange(value: unknown): value is NonNullable<Range> {
  return typeof value === "string" && ranges.some((range) => range === value);
}

/** All private reads use the same-origin Go rewrite and session cookie. Never cache cross-session data. */
export async function platformGet<T>(path: string, signal?: AbortSignal): Promise<T> {
  let response: Response;
  try {
    response = await fetch(`/api/v1/platform/${path}`, {
      credentials: "same-origin", cache: "no-store", redirect: "error", signal,
    });
  } catch (error) {
    if (signal?.aborted) throw error;
    throw new ApiError("network");
  }
  if (!response.ok) throw new ApiError("response", response.status);
  try { return await response.json() as T; } catch { throw new ApiError("invalid_response"); }
}

/**
 * Platform metadata writes (read markers) carry a session-bound CSRF token and
 * expect an empty 204. They never touch tenant content.
 */
export async function platformPost(path: string, body?: unknown): Promise<void> {
  let token: string;
  try { token = await csrfToken(); } catch (error) { if (error instanceof ApiError) throw error; throw new ApiError("network"); }
  let response: Response;
  try {
    response = await fetch(`/api/v1/platform/${path}`, {
      method: "POST",
      credentials: "same-origin",
      cache: "no-store",
      redirect: "error",
      headers: { "X-CSRF-Token": token, ...(body === undefined ? {} : { "Content-Type": "application/json" }) },
      ...(body === undefined ? {} : { body: JSON.stringify(body) }),
    });
  } catch { throw new ApiError("network"); }
  if (response.status !== 204) throw new ApiError("response", response.status);
}
