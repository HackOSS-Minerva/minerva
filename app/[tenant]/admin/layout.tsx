import { notFound, redirect } from "next/navigation";
import { fetchAuthQuery } from "@/lib/auth-server";
import { api } from "@/convex/_generated/api";
import { SignOutButton } from "@/components/profile/sign-out-button";
import { BYPASS_AUTH_IN_DEV } from "@/lib/dev-bypass";
import { isTenantSlug } from "@/hooks/get-tenant";

// Next.js types `params` from the route pattern, so the dynamic segment is an
// unvalidated `string` here. Narrow it to `TenantSlug` before passing it on.
interface AdminLayoutProps {
  children: React.ReactNode;
  params: Promise<{ tenant: string }>;
}

const Layout = async ({ children, params }: AdminLayoutProps) => {
  const { tenant: rawTenant } = await params;
  if (!isTenantSlug(rawTenant)) notFound();
  const tenant = rawTenant;

  // Secure check (the proxy only does an optimistic cookie redirect): validates
  // the session and the superadmin role. Skipped in dev via BYPASS_AUTH_IN_DEV.
  const access = BYPASS_AUTH_IN_DEV
    ? { authenticated: true as const, authorized: true as const, status: null }
    : await fetchAuthQuery(api.auth.getAdminAccess, { tenant });

  if (!access.authenticated) {
    redirect(`/${tenant}/sign-in?redirect=/${tenant}/admin`);
  }

  if (!access.authorized) {
    // Signed in with Google, but not an approved superadmin for this tenant.
    return (
      <div className="flex min-h-[60vh] items-center justify-center p-6">
        <div className="max-w-md space-y-3 text-center">
          <h1 className="text-2xl font-semibold">Unauthorized</h1>
          <p className="text-muted-foreground">
            You are signed in, but your account is not approved to manage
            <span className="font-medium"> {tenant}</span>.
            {access.status === "PENDING" ? (
              <> Your superadmin registration is still pending approval.</>
            ) : null}
          </p>
          <SignOutButton redirectTo={`/${tenant}/sign-in`} />
        </div>
      </div>
    );
  }

  return <>{children}</>;
};

export default Layout;
