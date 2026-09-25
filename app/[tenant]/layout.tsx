import { notFound } from "next/navigation";
import { getTenant } from "@/hooks/get-tenant";

interface TenantLayoutProps {
  children: React.ReactNode;
  params: Promise<{ tenant: string }>;
}

export default async function TenantLayout({
  children,
  params,
}: TenantLayoutProps) {
  const { tenant } = await params;

  if (!getTenant(tenant).config) {
    notFound();
  }

  return children;
}
