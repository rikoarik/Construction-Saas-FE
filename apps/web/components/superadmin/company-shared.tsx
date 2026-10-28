"use client";

import { useEffect, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useLocale } from "next-intl";
import { useRouter } from "@/i18n/navigation";
import { ApiError } from "@/lib/api/session";
import { companyCopy, useCompanyCopy, type CompanyCopy } from "./locale";
import { useOperator } from "./use-dashboard";
import { Button, Dialog } from "@/components/ui/primitives";
import { NoticeToast, useNoticeToast } from "@/components/ui/notice-toast";
import { changeCompanyStatus, CompanyApiError, type Company } from "@/lib/api/company-management";

export function usePermission(capability: string) {
  const operator = useOperator();
  return operator.data?.capabilities.includes(capability) ?? false;
}
export function useCompanyQuery<T>(key: unknown[], queryFn: (signal?: AbortSignal) => Promise<T>, enabled = true) {
  const router = useRouter();
  const operator = useOperator();
  const query = useQuery({ queryKey: ["company-management", operator.data?.user_id, ...key], queryFn: ({ signal }) => queryFn(signal), enabled: enabled && !!operator.data?.user_id, retry: false });
  useEffect(() => { if (query.error instanceof ApiError && query.error.status === 401) { router.replace("/login"); router.refresh(); } }, [query.error, router]);
  return query;
}
export function useRefreshCompanies() {
  const client = useQueryClient();
  return async () => { await Promise.all([client.invalidateQueries({ queryKey: ["company-management"] }), client.invalidateQueries({ queryKey: ["platform-dashboard"] })]); };
}
export function useCompanyError() {
  const router = useRouter();
  const c = useCompanyCopy();
  return (error: unknown) => {
    if (error instanceof ApiError && error.status === 401) { router.replace("/login"); router.refresh(); }
    return errorText(error, c);
  };
}
export function errorText(error: unknown, c: CompanyCopy = companyCopy): string {
  if (error instanceof CompanyApiError) {
    if (error.code === "LAST_COMPANY_ADMIN") return c.lastAdmin;
    if (error.code === "COMPANY_CODE_CONFLICT") return c.conflictCode;
    if (error.code === "INVITATION_CONFLICT") return c.invitationConflict;
    if (error.status === 409) return c.conflict;
  }
  if (error instanceof ApiError) {
    if (error.kind === "network") return c.networkError;
    if (error.status === 401) return c.unauthorized;
    if (error.status === 403) return c.forbiddenCompany;
    if (error.status === 404) return c.missingCompany;
    if (error.status === 400) return c.validationError;
    if (error.status === 409) return c.conflict;
  }
  return c.genericError;
}
export function QueryState({ error, retry }: { error: unknown; retry: () => void }) {
  const c = useCompanyCopy();
  return <div className="sa-company-state" role="alert"><p>{error instanceof ApiError && error.status === 403 ? c.restricted : error instanceof ApiError && error.status === 404 ? c.companyNotFound : errorText(error, c)}</p><Button onClick={retry}>{c.retryCompanies}</Button></div>;
}
export function CompanySkeleton() {
  const c = useCompanyCopy();
  return <div className="sa-panel sa-company-skeleton" role="status" aria-label={c.loadingCompanies}><span /><span /><span /><span /><span /></div>;
}
export function CompanyStatusBadge({ status }: { status: Company["status"] }) {
  const c = useCompanyCopy();
  return <span className={`sa-badge sa-badge--${status}`}>{c[status]}</span>;
}
export const display = (value: string | null | undefined, c: CompanyCopy = companyCopy) => value || c.unavailable;
export const dateText = (value: string | null | undefined, locale = "id", c: CompanyCopy = companyCopy) => value ? new Intl.DateTimeFormat(locale === "en" ? "en-US" : "id-ID", { dateStyle: "medium" }).format(new Date(value)) : c.unavailable;

export function useCompanyFormat() {
  const c = useCompanyCopy();
  const locale = useLocale();
  return { display: (value: string | null | undefined) => display(value, c), dateText: (value: string | null | undefined) => dateText(value, locale, c) };
}

export function StatusDialog({ company, onClose }: { company: Company | null; onClose: () => void }) {
  const c = useCompanyCopy();
  const [reason, setReason] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const refresh = useRefreshCompanies();
  const handleError = useCompanyError();
  const toast = useNoticeToast();
  const suspend = company?.status === "active";
  async function submit() {
    if (!company) return;
    if (suspend && (!reason.trim() || reason.trim().length > 1000)) { setError(c.reasonRequired); return; }
    setBusy(true); setError("");
    try { await changeCompanyStatus(company.id, suspend ? "suspend" : "reactivate", reason.trim()); await refresh(); onClose(); setReason(""); toast.notify(c.statusUpdated, "success"); }
    catch (err) { setError(handleError(err)); }
    finally { setBusy(false); }
  }
  return <><Dialog open={!!company} onOpenChange={(open) => { if (!open && !busy) { onClose(); setReason(""); setError(""); } }} title={suspend ? c.confirmSuspend : c.confirmReactivate} closeLabel={c.close} description={company?.name}>
    <p className="sa-company-warning">{suspend ? c.suspendWarning : c.reactivateWarning}</p>
    {suspend && <div className="ui-field"><label className="ui-field__label" htmlFor="company-suspend-reason">{c.reason} *</label><textarea id="company-suspend-reason" value={reason} onChange={(event) => { setReason(event.target.value); setError(""); }} maxLength={1000} required aria-invalid={!!error} aria-describedby={error ? "company-suspend-error" : undefined} className="ui-field__control sa-company-textarea" />{error && <p className="ui-field__error" id="company-suspend-error">{error}</p>}</div>}
    {!suspend && error && <p role="alert">{error}</p>}
    <div className="sa-company-actions"><Button onClick={onClose} disabled={busy}>{c.cancel}</Button><Button variant={suspend ? "danger" : "primary"} busy={busy} onClick={submit}>{suspend ? c.confirmSuspend : c.confirmReactivate}</Button></div>
  </Dialog><NoticeToast message={toast.message} onDismiss={toast.dismiss} dismissLabel={c.close} /></>;
}
