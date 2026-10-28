import { EmailLinkForm } from "@/components/auth/email-link-form";
import "../../login/style.css";

export default async function AcceptInvitationPage({ searchParams }: { searchParams: Promise<{ token?: string | string[] }> }) {
  const { token } = await searchParams;
  return <EmailLinkForm kind="invitations/accept" token={typeof token === "string" ? token : ""} />;
}
