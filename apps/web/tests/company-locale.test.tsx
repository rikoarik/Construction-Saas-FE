import { cleanup, renderHook } from "@testing-library/react";
import { NextIntlClientProvider } from "next-intl";
import { afterEach, describe, expect, it, vi } from "vitest";

vi.mock("@/i18n/navigation", () => ({ useRouter: () => ({ replace: vi.fn(), refresh: vi.fn() }) }));
import { useCompanyCopy } from "@/components/superadmin/locale";
import { useCompanyFormat } from "@/components/superadmin/company-shared";
import { validateCompany } from "@/components/superadmin/company-validation";

afterEach(cleanup);

const wrapper = (locale: string) => {
  function LocaleWrapper({ children }: { children: React.ReactNode }) {
    return <NextIntlClientProvider locale={locale}>{children}</NextIntlClientProvider>;
  }
  return LocaleWrapper;
};

describe("company locale", () => {
  it.each([
    ["id", "Manajemen Perusahaan", "Wajib diisi.", "2 Jan 2026"],
    ["en", "Company management", "This field is required.", "Jan 2, 2026"],
  ])("localizes copy, validation, and dates for %s", (locale, title, required, date) => {
    const { result } = renderHook(() => ({ copy: useCompanyCopy(), format: useCompanyFormat() }), { wrapper: wrapper(locale) });
    expect(result.current.copy.listTitle).toBe(title);
    expect(validateCompany({ name: "", code: "valid", legal_name: "", contact_email: "", phone: "", address: "", timezone: "UTC", admin_email: "a@example.com" }, false, result.current.copy).name).toBe(required);
    expect(result.current.format.dateText("2026-01-02T12:00:00Z")).toBe(date);
    expect(result.current.format.display(null)).toBe(result.current.copy.unavailable);
  });
});
