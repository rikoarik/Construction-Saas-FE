"use client";

import { ChevronRight } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { useCompanyCopy } from "./locale";

export function CompanyBreadcrumbs({ company, current }: { company?: { id: string; name: string }; current?: string }) {
  const c = useCompanyCopy();
  return <nav className="sa-company-breadcrumbs" aria-label={c.breadcrumbs}>
    <ol>
      <li><Link href="/superadmin/dashboard">{c.dashboard}</Link></li>
      <li><ChevronRight size={14} aria-hidden="true" />{!company && !current ? <span aria-current="page">{c.company}</span> : <Link href="/superadmin/companies">{c.company}</Link>}</li>
      {company && <li><ChevronRight size={14} aria-hidden="true" />{current ? <Link href={`/superadmin/companies/${company.id}`}>{company.name}</Link> : <span aria-current="page">{company.name}</span>}</li>}
      {current && <li><ChevronRight size={14} aria-hidden="true" /><span aria-current="page">{current}</span></li>}
    </ol>
  </nav>;
}
