import { EmailLinkForm } from "@/components/auth/email-link-form";
import "../login/style.css";

export default async function ResetPasswordPage({ searchParams }: { searchParams: Promise<{ token?: string | string[] }> }) {
  const { token } = await searchParams;
  return <EmailLinkForm kind="reset-password" token={typeof token === "string" ? token : ""} />;
}
