import { notFound } from "next/navigation";
import { isTenantSlug } from "@/hooks/get-tenant";

interface TenantLayoutProps {
  children: React.ReactNode;
  params: Promise<{ tenant: string }>;
}
export default const TenantLayout = async ({ children, params }: TenantLayoutProps) => {

} = await params;

  if (!isTenantSlug(tenant)) notFound();

  return children;
}
