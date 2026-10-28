import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { EditCompanyPage } from "@/components/superadmin/company-pages";
import "@/components/superadmin/superadmin.css";

export default async function Page({ params }: { params: Promise<{ locale: string; id: string }> }) {
  const { locale, id } = await params;
  if (!(await cookies()).has("session")) redirect(`/${locale}/login`);
  return <EditCompanyPage id={id} />;
}
