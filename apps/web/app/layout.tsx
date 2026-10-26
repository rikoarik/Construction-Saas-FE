import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Dexotic Groundwork",
  description: "Project delivery workspace.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
