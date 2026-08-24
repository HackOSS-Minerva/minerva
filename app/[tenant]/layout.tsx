import { notFound } from "next/navigation";
import { getTenantConfig } from "@/lib/tenant-config";

interface TenantLayoutProps {
  children: React.ReactNode;
  params: Promise<unknown>;
}

export default async function TenantLayout({
  children,
  params,
}: TenantLayoutProps) {
  const { tenant } = (await params) as { tenant: string };

  if (!getTenantConfig(tenant)) {
    notFound();
  }

  return children;
}
