import { notFound } from "next/navigation";
import { getTenant } from "@/hooks/get-tenant";

interface TenantLayoutProps {
  children: React.ReactNode;
  params: Promise<unknown>;
}

export default async function TenantLayout({
  children,
  params,
}: TenantLayoutProps) {
  const { tenant } = (await params) as { tenant: string };

  if (!getTenant(tenant).config) {
    notFound();
  }

  return children;
}
