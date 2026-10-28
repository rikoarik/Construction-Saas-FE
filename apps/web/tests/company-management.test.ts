import { afterEach, describe, expect, it, vi } from "vitest";
import { companyList, createCompany, cancelInvitation, setAdminStatus, CompanyApiError } from "@/lib/api/company-management";
import { validateCompany } from "@/components/superadmin/company-validation";

afterEach(() => vi.unstubAllGlobals());
const csrf = { csrf_token: "x".repeat(32) };
const valid = { name: "Nusantara", code: "nusantara", legal_name: "", contact_email: "", phone: "", address: "", timezone: "Asia/Jakarta", admin_email: "admin@example.com" };

describe("company management contract", () => {
  it("encodes search, status, sort and page without sharing browser cache", async () => {
    const fetcher = vi.fn().mockResolvedValue(new Response(JSON.stringify({ items: [], limit: 20, offset: 0, total: 0, has_more: false }), { status: 200 }));
    vi.stubGlobal("fetch", fetcher);
    await companyList({ search: "A & B", status: "active", sort: "name", limit: 20, offset: 0 });
    expect(fetcher).toHaveBeenCalledWith(expect.stringContaining("search=A+%26+B"), expect.objectContaining({ credentials: "same-origin", cache: "no-store" }));
  });
  it("requests a fresh CSRF token and keeps the same idempotency key on creation", async () => {
    const fetcher = vi.fn().mockResolvedValueOnce(new Response(JSON.stringify(csrf), { status: 200 })).mockResolvedValueOnce(new Response(JSON.stringify({ id: "one" }), { status: 201 }));
    vi.stubGlobal("fetch", fetcher);
    await createCompany({ name: valid.name, code: valid.code, admin_email: valid.admin_email }, "retry-key");
    expect(fetcher.mock.calls[1][1]).toMatchObject({ method: "POST", credentials: "same-origin", cache: "no-store", headers: { "X-CSRF-Token": csrf.csrf_token, "Idempotency-Key": "retry-key", "Content-Type": "application/json" } });
  });
  it("uses contract methods and preserves last-admin conflict code", async () => {
    const fetcher = vi.fn().mockResolvedValueOnce(new Response(JSON.stringify(csrf), { status: 200 })).mockResolvedValueOnce(new Response(JSON.stringify({ code: "LAST_COMPANY_ADMIN" }), { status: 409 }));
    vi.stubGlobal("fetch", fetcher);
    await expect(setAdminStatus("company", "user", "suspended")).rejects.toMatchObject({ status: 409, code: "LAST_COMPANY_ADMIN" });
    expect(fetcher.mock.calls[1][1].method).toBe("PATCH");
    expect(new CompanyApiError(409, "LAST_COMPANY_ADMIN").code).toBe("LAST_COMPANY_ADMIN");
  });
  it("accepts empty 204 on invitation revocation", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValueOnce(new Response(JSON.stringify(csrf), { status: 200 })).mockResolvedValueOnce(new Response(null, { status: 204 })));
    await expect(cancelInvitation("company", "invitation")).resolves.toBeUndefined();
  });
});

describe("company form validation", () => {
  it("validates immutable code, required email and timezone", () => {
    expect(validateCompany({ ...valid, code: "Bad Code", admin_email: "not-email", timezone: "Unknown/Zone" })).toMatchObject({ code: expect.any(String), admin_email: expect.any(String), timezone: expect.any(String) });
    expect(validateCompany(valid)).toEqual({});
    expect(validateCompany({ ...valid, code: "", admin_email: "" }, true)).toEqual({});
  });
});
