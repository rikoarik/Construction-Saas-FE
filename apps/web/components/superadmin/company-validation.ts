import { companyCopy, type CompanyCopy } from "./locale";

export type CompanyFields = { name: string; code: string; legal_name: string; contact_email: string; phone: string; address: string; timezone: string; admin_email: string };
const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
export function validateCompany(fields: CompanyFields, editing = false, copy: CompanyCopy = companyCopy): Partial<Record<keyof CompanyFields, string>> {
  const c = copy;
  const errors: Partial<Record<keyof CompanyFields, string>> = {};
  if (!fields.name.trim()) errors.name = c.required;
  else if (fields.name.trim().length > 200) errors.name = c.tooLong;
  if (!editing && !/^[a-z][a-z0-9_-]{1,39}$/.test(fields.code.trim())) errors.code = c.invalidCode;
  if (!editing && (!emailPattern.test(fields.admin_email.trim()) || fields.admin_email.trim().length > 254)) errors.admin_email = c.invalidEmail;
  if (fields.contact_email && (!emailPattern.test(fields.contact_email.trim()) || fields.contact_email.trim().length > 254)) errors.contact_email = c.invalidEmail;
  for (const [field, max] of [["legal_name", 200], ["phone", 40], ["address", 1000]] as const) if (fields[field].trim().length > max) errors[field] = c.tooLong;
  try { new Intl.DateTimeFormat("en", { timeZone: fields.timezone.trim() }); } catch { errors.timezone = c.invalidTimezone; }
  if (!fields.timezone.trim() || fields.timezone.trim().length > 100) errors.timezone = c.invalidTimezone;
  return errors;
}
