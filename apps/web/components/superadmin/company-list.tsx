"use client";

import { useDeferredValue, useState } from "react";
import { CirclePause, Eye, Pencil, Plus, RotateCcw, Search } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { Button, Dropdown, TableRegion, TextField } from "@/components/ui/primitives";
import { useCompanyCopy } from "./locale";
import { companyList, type Company, type CompanyFilters } from "@/lib/api/company-management";
import { CompanySkeleton, CompanyStatusBadge, QueryState, StatusDialog, useCompanyFormat, useCompanyQuery, usePermission } from "./company-shared";
import { CompanyPagination } from "./company-pagination";
import { CompanyBreadcrumbs } from "./company-breadcrumbs";
const statusOptions = ["", "provisioning", "active", "suspended", "archived"] as const;
const sortOptions = ["-created_at", "created_at", "name", "-name", "code", "-code"] as const;
export function CompanyList() {
  const c = useCompanyCopy();
  const { display, dateText } = useCompanyFormat();
  const sortLabels = [c.newest, c.oldest, c.nameAsc, c.nameDesc, c.codeAsc, c.codeDesc];
  const canCreate = usePermission("platform.company.create");
  const canUpdate = usePermission("platform.company.update");
  const canSuspend = usePermission("platform.company.suspend");
  const canReactivate = usePermission("platform.company.reactivate");
  const [search, setSearch] = useState("");
  const deferredSearch = useDeferredValue(search.trim());
  const [status, setStatus] = useState<CompanyFilters["status"]>();
  const [plan, setPlan] = useState("");
  const [knownPlans, setKnownPlans] = useState<Map<string, string>>(() => new Map());
  const [sort, setSort] = useState<NonNullable<CompanyFilters["sort"]>>("-created_at");
  const [limit, setLimit] = useState(10);
  const [offset, setOffset] = useState(0);
  const [target, setTarget] = useState<Company | null>(null);
  const filters: CompanyFilters = { search: deferredSearch || undefined, status, plan_id: plan || undefined, sort, limit, offset };
  const query = useCompanyQuery(["list", filters], (signal) => companyList(filters, signal));
  // The API has no plan catalogue; only plans observed in this session's company pages can be selected.
  const plans = Array.from(new Map([...knownPlans, ...(query.data?.items ?? []).filter((item) => item.plan_id && item.subscription_plan).map((item) => [item.plan_id!, item.subscription_plan!] as const)]).entries());
  const changePlan = (value: string) => {
    setKnownPlans((previous) => new Map([...previous, ...plans]));
    setPlan(value); setOffset(0);
  };
  return <>
    <CompanyBreadcrumbs />
    <div className="sa-heading"><div><h1>{c.listTitle}</h1><p>{c.listDescription}</p></div>{canCreate && <Link className="sa-company-primary-link" href="/superadmin/companies/new"><Plus size={16} aria-hidden="true" />{c.add}</Link>}</div>
    <section className="sa-panel sa-company-list"><div className="sa-company-filters">
      <div className="sa-company-search"><TextField label={c.searchCompany} placeholder={c.searchCompany} value={search} onChange={(e) => { setSearch(e.target.value); setOffset(0); }} maxLength={200} /><Search size={18} aria-hidden="true" /></div>
      <Dropdown label={c.filterStatus} value={status ?? ""} options={statusOptions.map((value) => ({ value, label: value ? c[value] : c.all }))} onChange={(value) => { setStatus(value ? value as CompanyFilters["status"] : undefined); setOffset(0); }} />
      <Dropdown label={c.filterPlan} value={plan} options={[{ value: "", label: c.allPlans }, ...plans.map(([value, label]) => ({ value, label }))]} onChange={changePlan} />
      <Dropdown label={c.sort} value={sort} options={sortOptions.map((value, index) => ({ value, label: sortLabels[index] }))} onChange={(value) => { setSort(value as typeof sort); setOffset(0); }} />
    </div>
      {query.isPending ? <CompanySkeleton /> : query.error ? <QueryState error={query.error} retry={() => query.refetch()} /> : !query.data?.items.length ? <div className="sa-company-state">{c.emptyCompanies}</div> : <TableRegion label={c.listTitle} caption={c.listDescription} className="sa-company-table"><thead><tr><th scope="col">{c.name}</th><th scope="col">{c.plan}</th><th scope="col">{c.members}</th><th scope="col">{c.projects}</th><th scope="col">{c.status}</th><th scope="col">{c.joined}</th><th scope="col">{c.actions}</th></tr></thead><tbody>{query.data.items.map((item) => <tr key={item.id}><td><Link href={`/superadmin/companies/${item.id}`} className="sa-company-name">{item.name}</Link><small>{item.code}</small></td><td>{display(item.subscription_plan)}</td><td>{item.member_count}</td><td>{item.project_count}</td><td><CompanyStatusBadge status={item.status} /></td><td>{dateText(item.created_at)}</td><td><div className="sa-company-row-actions"><Link className="sa-company-icon-action" href={`/superadmin/companies/${item.id}`} aria-label={c.detailAction.replace("{name}", item.name)} title={c.detail}><Eye size={17} aria-hidden="true" /></Link>{canUpdate && item.status !== "archived" && <Link className="sa-company-icon-action" href={`/superadmin/companies/${item.id}/edit`} aria-label={c.editAction.replace("{name}", item.name)} title={c.edit}><Pencil size={17} aria-hidden="true" /></Link>}{((item.status === "active" && canSuspend) || (item.status === "suspended" && canReactivate)) && <Button className="sa-company-icon-action sa-company-icon-action--critical" aria-label={(item.status === "active" ? c.suspendAction : c.reactivateAction).replace("{name}", item.name)} title={item.status === "active" ? c.suspend : c.reactivate} onClick={() => setTarget(item)}>{item.status === "active" ? <CirclePause size={17} aria-hidden="true" /> : <RotateCcw size={17} aria-hidden="true" />}</Button>}</div></td></tr>)}</tbody></TableRegion>}
      {query.data && <CompanyPagination total={query.data.total} count={query.data.items.length} hasMore={query.data.has_more} offset={offset} limit={limit} onPage={setOffset} onLimit={(value) => { setLimit(value); setOffset(0); }} />}
    </section>
    <StatusDialog company={target} onClose={() => setTarget(null)} />
  </>;
}
