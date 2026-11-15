import { notFound } from "next/navigation";
import { isTenantSlug } from "@/hooks/get-tenant";

interface TenantLayoutProps {
  children: React.ReactNode;
  params: Promise<{ tenant: string }>;
}

const TenantLayout = async ({ children, params }: TenantLayoutProps) => {
  const { tenant } = await params;

  if (!isTenantSlug(tenant)) notFound();

  return children;
};

export default TenantLayout;
