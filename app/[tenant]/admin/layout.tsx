import { notFound, redirect } from "next/navigation";
import Image from "next/image";
import { fetchAuthQuery } from "@/lib/auth-server";
import { api } from "@/convex/_generated/api";
import { SignOutButton } from "@/components/profile/sign-out-button";
import { BYPASS_AUTH_IN_DEV } from "@/lib/dev-bypass";
import { isTenantSlug } from "@/hooks/get-tenant";
import { tenantConfigs } from "@/tenants/generated";

interface AdminLayoutProps {
  children: React.ReactNode;
  params: Promise<{ tenant: string }>;
}

const Layout = async ({ children, params }: AdminLayoutProps) => {
  const { tenant } = await params;
  if (!isTenantSlug(tenant)) notFound();

  const access = BYPASS_AUTH_IN_DEV
    ? { authenticated: true as const, authorized: true as const, status: null }
    : await fetchAuthQuery(api.auth.getAdminAccess, { tenant });

  if (!access.authenticated) {
    redirect(`/${tenant}/sign-in?redirect=/${tenant}/admin/dashboards/superadmins`);
  }

  if (!access.authorized) {
    return (
      <div className="flex min-h-screen items-center justify-center p-6">
        <div className="w-full max-w-md space-y-4 text-center">
          <div className="flex justify-center">
            <Image src={tenantConfigs[tenant].logo} alt="Logo" width={120} height={120} className="w-28 h-28" />
          </div>
          <div className="space-y-3">
            <h1 className="text-2xl font-semibold">Unauthorized</h1>
            <p className="text-muted-foreground">
              You are signed in, but your account is not approved to manage
              <span className="font-medium"> {tenantConfigs[tenant].name}</span>.
              {access.status === "PENDING" ? (
                <> Your superadmin registration is still pending approval.</>
              ) : null}
            </p>
          </div>
          <SignOutButton redirectTo={`/${tenant}/sign-in`} />
        </div>
      </div>
    );
  }

  return <>{children}</>;
};

export default Layout;
