import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { SuperadminDashboard } from "@/components/superadmin/dashboard";
import { isRange } from "@/lib/api/platform-dashboard";
import "@/components/superadmin/superadmin.css";

export default async function DashboardPage({ params, searchParams }: { params: Promise<{ locale: string }>; searchParams: Promise<{ range?: string }> }) {
  const [{ locale }, query] = await Promise.all([params, searchParams]);
  if (!(await cookies()).has("session")) redirect(`/${locale}/login`);
  return <SuperadminDashboard range={isRange(query.range) ? query.range : "30d"} />;
}
