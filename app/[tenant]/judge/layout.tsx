import { redirect } from "next/navigation";
import { PortalNav } from "@/components/portal/portal-nav";
import {
  judgeNavItems,
  judgeDropdowns,
} from "@/components/portal/judge-nav-config";
import { fetchAuthQuery } from "@/lib/auth-server";
import { api } from "@/convex/_generated/api";
import { BYPASS_AUTH_IN_DEV } from "@/lib/dev-bypass";

interface LayoutProps {
  children: React.ReactNode;
  params: Promise<unknown>;
}

const Layout = async ({ children, params }: LayoutProps) => {
  const { tenant } = (await params) as { tenant: "designverse" | "cutiehack" };

  // The judge section requires a signed-in user. This is the secure check
  // (validates the session via Convex); the proxy only does an optimistic
  // cookie-existence redirect. Skipped entirely in dev so local development
  // never requires sign-in or a registered judge account.
  const { authenticated } = BYPASS_AUTH_IN_DEV
    ? { authenticated: true as const }
    : await fetchAuthQuery(api.auth.getAuthStatus, {});
  if (!authenticated) {
    redirect(`/${tenant}/sign-in?redirect=/${tenant}/judge/dashboard`);
  }

  // The Participate dropdown additionally requires an accepted judge
  // application; otherwise it is shown locked (grayed out, lock icon, register
  // prompt). Unlocked in dev via BYPASS_AUTH_IN_DEV.
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
