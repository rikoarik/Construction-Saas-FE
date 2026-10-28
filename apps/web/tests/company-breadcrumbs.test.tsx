import { cleanup, render, screen, within } from "@testing-library/react";
import { NextIntlClientProvider } from "next-intl";
import { afterEach, describe, expect, it, vi } from "vitest";
import { CompanyBreadcrumbs } from "@/components/superadmin/company-breadcrumbs";

vi.mock("@/i18n/navigation", () => ({ Link: ({ href, children, ...props }: React.ComponentProps<"a">) => <a href={href} {...props}>{children}</a> }));
afterEach(cleanup);

describe("company breadcrumbs", () => {
  it("marks the company list as the current page", () => {
    render(<NextIntlClientProvider locale="id"><CompanyBreadcrumbs /></NextIntlClientProvider>);
    const nav = screen.getByRole("navigation", { name: "Jejak navigasi" });
    expect(within(nav).getByRole("link", { name: "Dashboard" })).toHaveAttribute("href", "/superadmin/dashboard");
    expect(within(nav).getByText("Perusahaan")).toHaveAttribute("aria-current", "page");
  });

  it("links the company and list from an edit page without a back button", () => {
    render(<NextIntlClientProvider locale="id"><CompanyBreadcrumbs company={{ id: "company-id", name: "PT Contoh" }} current="Edit Perusahaan" /></NextIntlClientProvider>);
    const nav = screen.getByRole("navigation", { name: "Jejak navigasi" });
    expect(within(nav).getByRole("link", { name: "Perusahaan" })).toHaveAttribute("href", "/superadmin/companies");
    expect(within(nav).getByRole("link", { name: "PT Contoh" })).toHaveAttribute("href", "/superadmin/companies/company-id");
    expect(within(nav).getByText("Edit Perusahaan")).toHaveAttribute("aria-current", "page");
    expect(within(nav).queryByRole("button")).not.toBeInTheDocument();
  });

  it("uses English labels when the locale changes", () => {
    const { rerender } = render(<NextIntlClientProvider locale="id"><CompanyBreadcrumbs /></NextIntlClientProvider>);
    rerender(<NextIntlClientProvider locale="en"><CompanyBreadcrumbs /></NextIntlClientProvider>);
    const nav = screen.getByRole("navigation", { name: "Breadcrumbs" });
    expect(within(nav).getByText("Companies")).toHaveAttribute("aria-current", "page");
  });
});
