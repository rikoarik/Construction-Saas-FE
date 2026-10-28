"use client";

import { useEffect, useState } from "react";
import { QueryClient, QueryClientProvider, useQuery, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "@/i18n/navigation";
import { ApiError } from "@/lib/api/session";
import { platformGet, type Activities, type Companies, type CompanyStatus, type Dashboard, type Distribution, type Growth, type Integrations, type Jobs, type NotificationReadFilter, type Notifications, type NotificationTypeFilter, type Operator, type Range, type Storage } from "@/lib/api/platform-dashboard";

export function DashboardQueryProvider({ children }: { children: React.ReactNode }) {
  const [client] = useState(() => new QueryClient({ defaultOptions: { queries: { retry: false, staleTime: 0, gcTime: 0, refetchOnWindowFocus: false } } }));
  useEffect(() => () => client.clear(), [client]);
  return <QueryClientProvider client={client}>{children}</QueryClientProvider>;
}

export function usePlatformQuery<T>(key: string, path: string) {
  const router = useRouter();
  const query = useQuery({ queryKey: ["platform-dashboard", key, path], queryFn: ({ signal }) => platformGet<T>(path, signal) });
  useEffect(() => {
    if (query.error instanceof ApiError && query.error.status === 401) {
      router.replace("/login");
      router.refresh();
    }
  }, [query.error, router]);
  return query;
}

export const useOperator = () => usePlatformQuery<Operator>("operator", "me");
export const useDashboard = (range: NonNullable<Range>) => usePlatformQuery<Dashboard>("overview", `dashboard?range=${range}`);
export const useGrowth = (range: NonNullable<Range>) => usePlatformQuery<Growth>("growth", `dashboard/company-growth?range=${range}`);
export const useCompanyStatus = () => usePlatformQuery<CompanyStatus>("status", "dashboard/company-status");
export const useActivities = () => usePlatformQuery<Activities>("activities", "dashboard/activities?limit=5");
export const useCompanies = () => usePlatformQuery<Companies>("companies", "companies?sort=-created_at&limit=5");
export const useJobs = () => usePlatformQuery<Jobs>("jobs", "jobs?status=failed,retry_pending&limit=5");
/** Palette-wide index. Only fetched while the palette is open, so the dashboard
 *  never pays for a 100-row scan on first paint. */
export const usePaletteCompanies = (enabled: boolean) => useQuery({ queryKey: ["platform-dashboard", "palette-companies"], queryFn: ({ signal }) => platformGet<Companies>("companies?sort=-created_at&limit=100", signal), enabled, retry: false, staleTime: 30_000 });
export const usePaletteJobs = (enabled: boolean) => useQuery({ queryKey: ["platform-dashboard", "palette-jobs"], queryFn: ({ signal }) => platformGet<Jobs>("jobs?status=failed,retry_pending&limit=100", signal), enabled, retry: false, staleTime: 30_000 });
export const useDistribution = () => usePlatformQuery<Distribution>("distribution", "dashboard/subscription-distribution");
export const useStorage = () => usePlatformQuery<Storage>("storage", "dashboard/storage-usage");
export const useIntegrations = () => usePlatformQuery<Integrations>("integrations", "dashboard/integration-health");
/** Header feed. Always mounted so the bell badge reflects the operator's real
 *  unread count; the panel reuses the same query with the active filters. */
export const useNotifications = (type: NotificationTypeFilter, read: NotificationReadFilter) => {
  const query = new URLSearchParams({ limit: "20" });
  if (type) query.set("type", type);
  if (read) query.set("read", read);
  return usePlatformQuery<Notifications>(`notifications-${type || "all"}-${read || "all"}`, `notifications?${query.toString()}`);
};
/** Read markers are shared by every filter, so a write refreshes the whole
 *  platform cache instead of patching one page. */
export function useRefreshNotifications() {
  const client = useQueryClient();
  return () => client.invalidateQueries({ queryKey: ["platform-dashboard"] });
}
