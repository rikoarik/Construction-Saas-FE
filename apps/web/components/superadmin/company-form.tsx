"use client";

import { useRef, useState, type FormEvent } from "react";
import { Link, useRouter } from "@/i18n/navigation";
import { Button, TextField } from "@/components/ui/primitives";
import { NoticeToast, useNoticeToast } from "@/components/ui/notice-toast";
import { createCompany, updateCompany, type Company, type CreateCompany, type UpdateCompany } from "@/lib/api/company-management";
import { useCompanyCopy } from "./locale";
import { validateCompany, type CompanyFields } from "./company-validation";
import { useCompanyError, usePermission, useRefreshCompanies } from "./company-shared";
import { CompanyBreadcrumbs } from "./company-breadcrumbs";

type Fields = CompanyFields;
const initial: Fields = { name: "", code: "", legal_name: "", contact_email: "", phone: "", address: "", timezone: "UTC", admin_email: "" };

export function CompanyForm({ company }: { company?: Company }) {
  const c = useCompanyCopy();
  const router = useRouter();
  const refresh = useRefreshCompanies();
  const handleError = useCompanyError();
  const allowed = usePermission(company ? "platform.company.update" : "platform.company.create");
  const toast = useNoticeToast();
  const [fields, setFields] = useState<Fields>(() => company ? { name: company.name, code: company.code, legal_name: company.legal_name ?? "", contact_email: company.contact_email ?? "", phone: company.phone ?? "", address: company.address ?? "", timezone: company.timezone, admin_email: "" } : initial);
  const [errors, setErrors] = useState<Partial<Record<keyof Fields, string>>>({});
  const [busy, setBusy] = useState(false);
  const requestKey = useRef<string | null>(null);
  const update = (key: keyof Fields, value: string) => { setFields((previous) => ({ ...previous, [key]: value })); setErrors((previous) => ({ ...previous, [key]: undefined })); requestKey.current = null; };
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const validation = validateCompany(fields, !!company, c);
    setErrors(validation);
    if (Object.keys(validation).length || !allowed) return;
    // The backend ignores null on PATCH; omit unchanged blank values instead of promising a clear that cannot persist.
    const editable: UpdateCompany = { name: fields.name.trim(), timezone: fields.timezone.trim() };
    for (const key of ["legal_name", "contact_email", "phone", "address"] as const) {
      const value = fields[key].trim();
      if (!company || value !== (company[key] ?? "")) {
        if (value) editable[key] = value;
        else if (company?.[key]) { setErrors((previous) => ({ ...previous, [key]: c.cannotClear })); return; }
      }
    }
    if (company && Object.entries(editable).every(([key, value]) => company[key as keyof Company] === value)) { toast.notify(c.noChange, "info"); return; }
    setBusy(true);
    try {
      const key = requestKey.current ?? crypto.randomUUID();
      if (!company) requestKey.current = key;
      const saved = company ? await updateCompany(company.id, editable) : await createCompany({ ...editable, code: fields.code.trim(), admin_email: fields.admin_email.trim() } as CreateCompany, key);
      await refresh();
      if (company) toast.notify(c.saved, "success");
      else { try { window.sessionStorage.setItem(`company-created:${saved.id}`, "1"); } catch { /* Storage may be disabled. */ } router.push(`/superadmin/companies/${saved.id}`); }
    } catch (error) { toast.notify(handleError(error)); }
    finally { setBusy(false); }
  }
  return <>
    <CompanyBreadcrumbs company={company ? { id: company.id, name: company.name } : undefined} current={company ? c.editTitle : c.createTitle} />
    <div className="sa-heading"><div><h1>{company ? c.editTitle : c.createTitle}</h1><p>{company ? c.editDescription : c.createDescription}</p></div></div>
    {!allowed ? <p role="alert">{c.forbiddenCompany}</p> : <form onSubmit={submit} noValidate className="sa-company-form">
      <section className="sa-panel"><div className="sa-panel__header"><h2>{c.companyInfo}</h2></div><div className="sa-company-fields">
        <TextField label={c.name} value={fields.name} onChange={(e) => update("name", e.target.value)} error={errors.name} required maxLength={201} />
        <TextField label={c.code} value={fields.code} onChange={(e) => update("code", e.target.value)} error={errors.code} hint={company ? (company.code === `c_${company.id.replaceAll("-", "")}` ? c.legacyCodeHint : c.codeImmutable) : c.codeHint} disabled={!!company} required={!company} maxLength={40} autoCapitalize="none" />
        <TextField label={c.legalName} value={fields.legal_name} onChange={(e) => update("legal_name", e.target.value)} error={errors.legal_name} maxLength={201} />
        <TextField label={c.contactEmail} type="email" value={fields.contact_email} onChange={(e) => update("contact_email", e.target.value)} error={errors.contact_email} />
        <TextField label={c.phone} type="tel" value={fields.phone} onChange={(e) => update("phone", e.target.value)} error={errors.phone} maxLength={41} />
        <TextField label={c.timezone} value={fields.timezone} onChange={(e) => update("timezone", e.target.value)} error={errors.timezone} required />
        <div className="ui-field sa-company-wide"><label className="ui-field__label" htmlFor="company-address">{c.address}</label><textarea id="company-address" className="ui-field__control sa-company-textarea" value={fields.address} maxLength={1001} aria-invalid={!!errors.address} aria-describedby={errors.address ? "company-address-error" : undefined} onChange={(e) => update("address", e.target.value)} />{errors.address && <p className="ui-field__error" id="company-address-error">{errors.address}</p>}</div>
      </div></section>
      {!company && <section className="sa-panel"><div className="sa-panel__header"><h2>{c.firstAdmin}</h2></div><div className="sa-company-fields"><TextField label={c.adminEmail} type="email" value={fields.admin_email} onChange={(e) => update("admin_email", e.target.value)} error={errors.admin_email} hint={c.adminEmailHint} required /></div><p className="sa-company-note">{c.adminNameUnavailable}</p></section>}
      <div className="sa-company-actions"><Link href={company ? `/superadmin/companies/${company.id}` : "/superadmin/companies"} className="sa-company-back">{c.cancel}</Link><Button type="submit" variant="primary" busy={busy}>{company ? c.save : c.create}</Button></div>
    </form>}
    <NoticeToast message={toast.message} onDismiss={toast.dismiss} dismissLabel={c.close} />
  </>;
}
