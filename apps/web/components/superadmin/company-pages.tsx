"use client";

import { SuperadminLayout } from "./shell";
import { DashboardQueryProvider } from "./use-dashboard";
import { CompanyList } from "./company-list";
import { CompanyDetail } from "./company-detail";
import { CompanyForm } from "./company-form";
import { CompanySkeleton, QueryState, useCompanyQuery, usePermission } from "./company-shared";
import { companyDetail } from "@/lib/api/company-management";
import { useCompanyCopy } from "./locale";

export function CompaniesPage() { return <DashboardQueryProvider><SuperadminLayout><CompanyList /></SuperadminLayout></DashboardQueryProvider>; }
export function NewCompanyPage() { return <DashboardQueryProvider><SuperadminLayout><CompanyForm /></SuperadminLayout></DashboardQueryProvider>; }
export function CompanyDetailPage({ id }: { id: string }) { return <DashboardQueryProvider><SuperadminLayout><CompanyDetail id={id} /></SuperadminLayout></DashboardQueryProvider>; }
function EditCompanyContent({ id }: { id: string }) {
  const c = useCompanyCopy();
  const allowed = usePermission("platform.company.read");
  const validId = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);
  const query = useCompanyQuery(["detail", id], (signal) => companyDetail(id, signal), allowed && validId);
  if (!allowed) return <p role="alert">{c.forbiddenCompany}</p>;
  if (!validId) return <p role="alert">{c.invalidId}</p>;
  if (query.isPending) return <CompanySkeleton />;
  if (query.error || !query.data) return <QueryState error={query.error} retry={() => query.refetch()} />;
  return <CompanyForm key={id} company={query.data} />;
}
export function EditCompanyPage({ id }: { id: string }) { return <DashboardQueryProvider><SuperadminLayout><EditCompanyContent id={id} /></SuperadminLayout></DashboardQueryProvider>; }
