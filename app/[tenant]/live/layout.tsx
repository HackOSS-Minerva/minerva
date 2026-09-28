import { notFound } from "next/navigation";
import { PortalNav } from "@/components/portal/portal-nav";
import {
  liveNavItems,
  liveDropdowns,
} from "@/components/portal/live-nav-config";
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

  // Participate is unlocked only for signed-in accepted participants; everyone
  // else sees it locked with a register prompt. Unlocked in dev.
  const access = BYPASS_AUTH_IN_DEV
    ? { authorized: true as const }
    : await fetchAuthQuery(api.auth.getParticipantAccess, {
        tenant,
      });

  return (
    <div className="mx-auto max-w-4xl space-y-6 px-4 py-6 md:py-10">
      <PortalNav
        tenant={tenant}
        dashboardPath="/live/dashboard"
        navItems={liveNavItems}
        dropdowns={liveDropdowns}
        isAuthorized={access.authorized}
        registerHref="/forms/participant"
      />
      {children}
    </div>
  );
};

export default Layout;
