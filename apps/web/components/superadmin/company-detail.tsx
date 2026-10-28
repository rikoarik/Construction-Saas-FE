"use client";

import { useEffect, useState } from "react";
import { RotateCw, XCircle } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { Button, Dialog, TableRegion, TextField } from "@/components/ui/primitives";
import { NoticeToast, useNoticeToast } from "@/components/ui/notice-toast";
import { cancelInvitation, companyAdmins, companyDetail, companyUsage, inviteAdmin, resendInvitation, setAdminStatus, type Admin, type Invitation } from "@/lib/api/company-management";
import { useCompanyCopy } from "./locale";
import { CompanySkeleton, CompanyStatusBadge, QueryState, StatusDialog, useCompanyFormat, useCompanyError, useCompanyQuery, usePermission, useRefreshCompanies } from "./company-shared";
import { CompanyBreadcrumbs } from "./company-breadcrumbs";

type Tab = "overviewTab" | "infoTab" | "adminsTab" | "projectsTab" | "subscriptionTab" | "activityTab";
const tabs: Tab[] = ["overviewTab", "infoTab", "adminsTab", "projectsTab", "subscriptionTab", "activityTab"];
type Action = { type: "revoke" | "deactivate" | "activateAdmin"; email: string; id: string };
export function CompanyDetail({ id }: { id: string }) {
  const c = useCompanyCopy();
  const { display, dateText } = useCompanyFormat();
  const read = usePermission("platform.company.read");
  const readMembers = usePermission("platform.member.read");
  const edit = usePermission("platform.company.update");
  const suspend = usePermission("platform.company.suspend");
  const reactivate = usePermission("platform.company.reactivate");
  const invite = usePermission("platform.member.invite");
  const revoke = usePermission("platform.member.revoke");
  const refresh = useRefreshCompanies();
  const handleError = useCompanyError();
  const toast = useNoticeToast();
  const { notify } = toast;
  useEffect(() => {
    const key = `company-created:${id}`;
    try { if (window.sessionStorage.getItem(key) === "1") { window.sessionStorage.removeItem(key); notify(c.created, "success"); } } catch { /* Storage may be disabled. */ }
  }, [id, notify, c.created]);
  const [tab, setTab] = useState<Tab>("overviewTab");
  const [statusTarget, setStatusTarget] = useState<Awaited<ReturnType<typeof companyDetail>> | null>(null);
  const [inviteOpen, setInviteOpen] = useState(false);
  const [inviteEmail, setInviteEmail] = useState("");
  const [action, setAction] = useState<Action | null>(null);
  const [busy, setBusy] = useState(false);
  const [actionError, setActionError] = useState("");
  const validId = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);
  const company = useCompanyQuery(["detail", id], (signal) => companyDetail(id, signal), read && validId);
  const usage = useCompanyQuery(["usage", id], (signal) => companyUsage(id, signal), read && !!company.data);
  const admins = useCompanyQuery(["admins", id], (signal) => companyAdmins(id, signal), readMembers && !!company.data && tab === "adminsTab");
  async function sendInvite() {
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(inviteEmail.trim()) || inviteEmail.trim().length > 254) { setActionError(c.invalidEmail); return; }
    setBusy(true); setActionError("");
    try { await inviteAdmin(id, inviteEmail.trim()); await refresh(); setInviteOpen(false); setInviteEmail(""); toast.notify(c.inviteSuccess, "success"); }
    catch (error) { setActionError(handleError(error)); }
    finally { setBusy(false); }
  }
  async function resend(entry: Invitation) {
    setBusy(true);
    try { await resendInvitation(id, entry.id); await refresh(); toast.notify(c.resendSuccess, "success"); }
    catch (error) { toast.notify(handleError(error)); }
    finally { setBusy(false); }
  }
  async function confirmAction() {
    if (!action) return;
    setBusy(true); setActionError("");
    try {
      if (action.type === "revoke") await cancelInvitation(id, action.id);
      else await setAdminStatus(id, action.id, action.type === "deactivate" ? "suspended" : "active");
      await refresh(); toast.notify(action.type === "revoke" ? c.revokeSuccess : c.adminSuccess, "success"); setAction(null);
    } catch (error) { setActionError(handleError(error)); }
    finally { setBusy(false); }
  }
  if (!read) return <div role="alert">{c.forbiddenCompany}</div>;
  if (!validId) return <div role="alert">{c.invalidId}</div>;
  if (company.isPending) return <CompanySkeleton />;
  if (company.error || !company.data) return <QueryState error={company.error} retry={() => company.refetch()} />;
  const item = company.data;
  const row = (label: string, value: string | number | null | undefined) => <div className="sa-company-datum" key={label}><dt>{label}</dt><dd>{typeof value === "number" ? value : display(value)}</dd></div>;
  return <>
    <CompanyBreadcrumbs company={{ id, name: item.name }} />
    <div className="sa-heading sa-company-detail-header"><div><h1>{item.name}</h1><p>{item.code} · {c.createdAt}: {dateText(item.created_at)}</p></div><div className="sa-company-heading-actions"><CompanyStatusBadge status={item.status} />{edit && item.status !== "archived" && <Link href={`/superadmin/companies/${id}/edit`} className="sa-company-secondary-link">{c.edit}</Link>}{((item.status === "active" && suspend) || (item.status === "suspended" && reactivate)) && <Button variant={item.status === "active" ? "danger" : "secondary"} onClick={() => setStatusTarget(item)}>{item.status === "active" ? c.suspend : c.reactivate}</Button>}</div></div>
    <nav className="sa-company-tabs" aria-label={c.companyDetails}>{tabs.map((key) => <Button key={key} aria-current={tab === key ? "page" : undefined} onClick={() => setTab(key)}>{c[key]}</Button>)}</nav>
    {tab === "overviewTab" && <div className="sa-company-overview"><section className="sa-panel"><h2>{c.overviewTab}</h2><dl className="sa-company-data">{row(c.members, item.member_count)}{row(c.projects, item.project_count)}{row(c.plan, item.subscription_plan)}{row(c.lastActivity, item.last_activity_at ? dateText(item.last_activity_at) : null)}</dl></section><section className="sa-panel"><h2>{c.companyInfo}</h2><dl className="sa-company-data">{row(c.contactEmail, item.contact_email)}{row(c.phone, item.phone)}{row(c.timezone, item.timezone)}{row(c.status, c[item.status])}</dl></section></div>}
    {tab === "infoTab" && <section className="sa-panel"><h2>{c.infoTab}</h2><dl className="sa-company-data">{row(c.name, item.name)}{row(c.companyId, item.id)}{row(c.code, item.code)}{row(c.legalName, item.legal_name)}{row(c.contactEmail, item.contact_email)}{row(c.phone, item.phone)}{row(c.address, item.address)}{row(c.timezone, item.timezone)}{row(c.joined, dateText(item.created_at))}{row(c.updatedAt, dateText(item.updated_at))}{item.suspended_reason && row(c.suspendedReason, item.suspended_reason)}</dl></section>}
    {tab === "projectsTab" && <section className="sa-panel"><h2>{c.projectsTab}</h2>{usage.isPending ? <CompanySkeleton /> : usage.error ? <QueryState error={usage.error} retry={() => usage.refetch()} /> : <dl className="sa-company-data">{row(c.count, usage.data?.project_count ?? null)}</dl>}<p className="sa-company-note">{c.projectNote}</p></section>}
    {tab === "subscriptionTab" && <section className="sa-panel"><h2>{c.subscriptionTab}</h2><dl className="sa-company-data">{row(c.plan, item.subscription_plan)}</dl><p className="sa-company-note">{c.subscriptionNote}</p></section>}
    {tab === "activityTab" && <section className="sa-panel"><h2>{c.activityTab}</h2><dl className="sa-company-data">{row(c.lastActivity, item.last_activity_at ? dateText(item.last_activity_at) : null)}</dl><p className="sa-company-note">{c.activityNote}</p></section>}
    {tab === "adminsTab" && <section className="sa-panel"><div className="sa-panel__header"><h2>{c.adminsTitle}</h2>{invite && item.status !== "archived" && <Button variant="primary" onClick={() => setInviteOpen(true)}>{c.invite}</Button>}</div>{!readMembers ? <p>{c.restricted}</p> : admins.isPending ? <CompanySkeleton /> : admins.error ? <QueryState error={admins.error} retry={() => admins.refetch()} /> : !admins.data?.members.length && !admins.data?.invitations.length ? <p className="sa-company-state">{c.noAdmins}</p> : <TableRegion label={c.adminsTitle} caption={c.adminsTitle} className="sa-company-table sa-company-admin-table"><thead><tr><th scope="col">{c.email}</th><th scope="col">{c.role}</th><th scope="col">{c.accountStatus}</th><th scope="col">{c.joinDate}</th><th scope="col">{c.actions}</th></tr></thead><tbody>{admins.data.members.map((entry: Admin) => <tr key={entry.user_id}><td>{entry.email}</td><td>{entry.role === "owner" ? c.owner : c.admin}</td><td><span className={`sa-badge sa-badge--${entry.status}`}>{c[entry.status]}</span></td><td>{dateText(entry.created_at)}</td><td>{revoke && (entry.status === "active" || entry.status === "suspended") && <Button variant={entry.status === "active" ? "danger" : "secondary"} onClick={() => { setActionError(""); setAction({ type: entry.status === "active" ? "deactivate" : "activateAdmin", email: entry.email, id: entry.user_id }); }}>{entry.status === "active" ? c.deactivate : c.activateAdmin}</Button>}</td></tr>)}{admins.data.invitations.map((entry: Invitation) => <tr key={entry.id}><td>{entry.email}</td><td>{c.admin}</td><td><span className={`sa-badge sa-badge--${entry.status}`}>{c[entry.status]}</span></td><td>{dateText(entry.created_at)}</td><td><div className="sa-company-row-actions">{entry.status === "pending" && invite && <Button className="sa-company-admin-action" disabled={busy} aria-label={`${c.resend}: ${entry.email}`} title={c.resend} onClick={() => resend(entry)}><RotateCw size={17} aria-hidden="true" /></Button>}{entry.status === "pending" && revoke && <Button className="sa-company-admin-action sa-company-admin-action--critical" aria-label={`${c.revoke}: ${entry.email}`} title={c.revoke} onClick={() => { setActionError(""); setAction({ type: "revoke", email: entry.email, id: entry.id }); }}><XCircle size={17} aria-hidden="true" /></Button>}</div></td></tr>)}</tbody></TableRegion>}</section>}
    <StatusDialog company={statusTarget} onClose={() => setStatusTarget(null)} />
    <Dialog open={inviteOpen} onOpenChange={(open) => { if (!busy) { setInviteOpen(open); setActionError(""); } }} title={c.inviteTitle} closeLabel={c.close} description={c.inviteHint}><TextField label={c.email} type="email" value={inviteEmail} onChange={(e) => { setInviteEmail(e.target.value); setActionError(""); }} error={actionError} required /><div className="sa-company-actions"><Button onClick={() => setInviteOpen(false)} disabled={busy}>{c.cancel}</Button><Button variant="primary" busy={busy} onClick={sendInvite}>{c.invite}</Button></div></Dialog>
    <Dialog open={!!action} onOpenChange={(open) => { if (!open && !busy) { setAction(null); setActionError(""); } }} title={action ? c[action.type === "revoke" ? "confirmRevoke" : action.type === "deactivate" ? "confirmDeactivate" : "confirmActivateAdmin"] : c.confirm} closeLabel={c.close} description={action?.email}><p className="sa-company-warning">{item.name}</p>{actionError && <p role="alert">{actionError}</p>}<div className="sa-company-actions"><Button onClick={() => setAction(null)} disabled={busy}>{c.cancel}</Button><Button variant={action?.type === "activateAdmin" ? "primary" : "danger"} busy={busy} onClick={confirmAction}>{c.confirm}</Button></div></Dialog>
    <NoticeToast message={toast.message} onDismiss={toast.dismiss} dismissLabel={c.close} />
  </>;
}
