import { notFound, redirect } from "next/navigation";
import { PortalNav } from "@/components/portal/portal-nav";
import {
  judgeNavItems,
  judgeDropdowns,
} from "@/components/portal/judge-nav-config";
import { fetchAuthQuery } from "@/lib/auth-server";
import { api } from "@/convex/_generated/api";
import { BYPASS_AUTH_IN_DEV } from "@/lib/dev-bypass";
import { isTenantSlug } from "@/hooks/get-tenant";

// `params` is typed from the route pattern by Next.js, so the dynamic segment is
// an unvalidated `string` here. Narrow it to `TenantSlug` before passing it on.
interface LayoutProps {
  children: React.ReactNode;
  params: Promise<{ tenant: string }>;
}

const Layout = async ({ children, params }: LayoutProps) => {
  const { tenant: rawTenant } = await params;
  if (!isTenantSlug(rawTenant)) notFound();
  const tenant = rawTenant;

  // Secure check (the proxy only does an optimistic cookie redirect). Skipped
  // in dev via BYPASS_AUTH_IN_DEV.
  const { authenticated } = BYPASS_AUTH_IN_DEV
    ? { authenticated: true as const }
    : await fetchAuthQuery(api.auth.getAuthStatus, {});
  if (!authenticated) {
    redirect(`/${tenant}/sign-in?redirect=/${tenant}/judge/dashboard`);
  }

  // Participate also requires an accepted judge application; otherwise the
  // dropdown renders locked with a register prompt. Unlocked in dev.
  const access = BYPASS_AUTH_IN_DEV
    ? { authorized: true as const }
    : await fetchAuthQuery(api.auth.getJudgeAccess, { tenant });

  return (
    <div className="mx-auto max-w-4xl space-y-6 px-4 py-6 md:py-10">
      <PortalNav
        tenant={tenant}
        dashboardPath="/judge/dashboard"
        navItems={judgeNavItems}
        dropdowns={judgeDropdowns}
        isAuthorized={access.authorized}
        registerHref="/forms/judge"
      />
      {children}
    </div>
  );
};

export default Layout;
