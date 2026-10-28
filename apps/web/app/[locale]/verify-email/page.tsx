import { EmailLinkForm } from "@/components/auth/email-link-form";
import "../login/style.css";

export default async function VerifyEmailPage({ searchParams }: { searchParams: Promise<{ token?: string | string[] }> }) {
  const { token } = await searchParams;
  return <EmailLinkForm kind="verify-email" token={typeof token === "string" ? token : ""} />;
}
