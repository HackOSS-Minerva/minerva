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

interface LayoutProps {
  children: React.ReactNode;
  params: Promise<{ tenant: string }>;
}

const Layout = async ({ children, params }: LayoutProps) => {
  const { tenant } = await params;
  if (!isTenantSlug(tenant)) notFound();

  // Whether the visitor can access the Participate section: signed in AND an
  // accepted participant. Signed-out / non-accepted users still see it in the
  // menu bar, but grayed out with a lock icon and a "Register to get access"
  // prompt. In dev (`next dev`) everything is unlocked via BYPASS_AUTH_IN_DEV
  // so local development never requires a registered participant account.
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
