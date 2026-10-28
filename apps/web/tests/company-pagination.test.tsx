import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { NextIntlClientProvider } from "next-intl";
import { afterEach, describe, expect, it, vi } from "vitest";
import { CompanyPagination } from "@/components/superadmin/company-pagination";
import { companyPageNumbers, companyPageRange } from "@/components/superadmin/company-page-utils";

afterEach(cleanup);

describe("company pagination", () => {
  it("shows the returned row range and navigates by a real page offset", () => {
    const onPage = vi.fn();
    const onLimit = vi.fn();
    render(<NextIntlClientProvider locale="id"><CompanyPagination total={14} count={10} hasMore offset={0} limit={10} onPage={onPage} onLimit={onLimit} /></NextIntlClientProvider>);
    expect(screen.getByText("Menampilkan 1–10 dari 14 perusahaan")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Sebelumnya" })).toBeDisabled();
    fireEvent.click(screen.getByRole("button", { name: "Ke halaman 2" }));
    expect(onPage).toHaveBeenCalledWith(10);
    fireEvent.click(screen.getByRole("button", { name: "Baris per halaman: 10 baris" }));
    fireEvent.click(screen.getByRole("option", { name: "20 baris" }));
    expect(onLimit).toHaveBeenCalledWith(20);
  });

  it("handles the final page, empty results and the backend offset limit", () => {
    expect(companyPageRange(14, 10, 10, 4)).toEqual({ start: 11, end: 14, total: 14 });
    expect(companyPageRange(0, 10, 0, 0)).toEqual({ start: 0, end: 0, total: 0 });
    expect(companyPageNumbers(99999, 10, 10000).at(-1)).toBe(1001);
    const onPage = vi.fn();
    render(<NextIntlClientProvider locale="id"><CompanyPagination total={14} count={4} hasMore={false} offset={10} limit={10} onPage={onPage} onLimit={vi.fn()} /></NextIntlClientProvider>);
    expect(screen.getByText("Menampilkan 11–14 dari 14 perusahaan")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Berikutnya" })).toBeDisabled();
    expect(screen.getByRole("button", { name: "Ke halaman 2" })).toHaveAttribute("aria-current", "page");
  });

  it("localizes pagination and accessible controls in English", () => {
    render(<NextIntlClientProvider locale="en"><CompanyPagination total={14} count={10} hasMore offset={0} limit={10} onPage={vi.fn()} onLimit={vi.fn()} /></NextIntlClientProvider>);
    expect(screen.getByText("Showing 1–10 of 14 companies")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Previous" })).toBeDisabled();
    expect(screen.getByRole("button", { name: "Go to page 2" })).toBeInTheDocument();
  });
});
