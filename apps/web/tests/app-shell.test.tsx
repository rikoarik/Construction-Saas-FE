import { cleanup, fireEvent, render, screen, within } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { NextIntlClientProvider } from "next-intl";
import en from "../messages/en.json";
import id from "../messages/id.json";
import { AppShell, type ShellScope } from "../components/layout/app-shell";
import { HomePage } from "../components/layout/home-page";

let pathname = "/";
vi.mock("@/i18n/navigation", () => ({
  usePathname: () => pathname,
  useRouter: () => ({ replace: vi.fn() }),
  Link: ({ href, children, ...props }: React.ComponentProps<"a">) => <a href={href} {...props}>{children}</a>,
}));

const company: ShellScope = {
  kind: "company",
  name: "A very long construction company name that must wrap without overflowing the sidebar",
  destinations: [{ href: "/", label: "Overview" }, { href: "/projects", label: "Projects" }],
};
const project: ShellScope = {
  kind: "project", name: "Coastal bridge package A", companyName: "Works Ltd",
  projectsHref: "/projects",
  destinations: [{ href: "/projects/example", label: "Project overview" }],
};

function mount(scope?: ShellScope, locale: "en" | "id" = "en") {
  return render(<NextIntlClientProvider locale={locale} messages={locale === "en" ? en : id}>
    <AppShell scope={scope}><HomePage /></AppShell>
  </NextIntlClientProvider>);
}

afterEach(() => { cleanup(); pathname = "/"; vi.restoreAllMocks(); });

describe("application shell", () => {
  it("does not advertise unimplemented routes, tenant identity, or actions without an authorized scope", () => {
    mount();
    const nav = screen.getByRole("navigation", { name: "Navigation" });
    expect(within(nav).getAllByRole("link")).toHaveLength(1);
    expect(within(nav).getByRole("link", { name: "Overview" })).toHaveAttribute("href", "/");
    expect(within(nav).getByRole("link", { name: "Overview" })).toHaveAttribute("aria-current", "page");
    expect(screen.queryByRole("link", { name: /projects|reports|documents/i })).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /company|project|search/i })).not.toBeInTheDocument();
    expect(screen.getByText(en.home.unavailableDescription)).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Skip to content" })).toHaveAttribute("href", "#main-content");
  });

  it("renders only provided destinations and reflects company/project scope without pretending to switch it", () => {
    const { rerender } = mount(company);
    expect(screen.getAllByText(company.name)).toHaveLength(2);
    expect(screen.queryByRole("button", { name: company.name })).not.toBeInTheDocument();
    const nav = screen.getByRole("navigation", { name: "Navigation" });
    expect(within(nav).getAllByRole("link")).toHaveLength(2);
    pathname = "/projects/example";
    rerender(<NextIntlClientProvider locale="en" messages={en}><AppShell scope={project}><HomePage /></AppShell></NextIntlClientProvider>);
    expect(screen.queryAllByText(company.name)).toHaveLength(0);
    expect(screen.getByText("Works Ltd")).toBeInTheDocument();
    expect(within(nav).getAllByRole("link")).toHaveLength(2);
    expect(within(nav).getByRole("link", { name: "Back to projects" })).toHaveAttribute("href", "/projects");
    expect(within(nav).getByRole("link", { name: "Project overview" })).toHaveAttribute("aria-current", "page");
  });

  it("exposes a labeled drawer toggle, closes on Escape and scrim, and restores keyboard focus", () => {
    mount();
    const open = screen.getByRole("button", { name: "Open navigation" });
    expect(open).toHaveAttribute("aria-expanded", "false");
    fireEvent.click(open);
    expect(open).toHaveAttribute("aria-label", "Close navigation");
    expect(open).toHaveAttribute("aria-expanded", "true");
    expect(screen.getByRole("complementary", { name: "Navigation" })).toHaveFocus();
    fireEvent.keyDown(document, { key: "Escape" });
    expect(open).toHaveFocus();
    expect(open).toHaveAttribute("aria-expanded", "false");
    fireEvent.click(open);
    fireEvent.click(document.querySelector(".mobile-scrim")!);
    expect(open).toHaveFocus();
  });

  it("renders Indonesian navigation and permission-neutral status", () => {
    mount(undefined, "id");
    expect(screen.getByRole("navigation", { name: "Navigasi" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Buka navigasi" })).toBeInTheDocument();
    expect(screen.getByText(id.home.unavailableDescription)).toBeInTheDocument();
  });
});
