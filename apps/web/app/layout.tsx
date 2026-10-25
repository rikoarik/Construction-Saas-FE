import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Construction SaaS",
  description: "Construction project delivery workspace.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return children;
}
