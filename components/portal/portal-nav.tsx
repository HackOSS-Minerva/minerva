import Image from "next/image";
import Link from "next/link";
import { getTenant, type TenantSlug } from "@/hooks/get-tenant";
import { getFeatureFlag, type FeatureFlagKey } from "@/lib/feature-flags";
import { PortalNavItems } from "@/components/portal/portal-nav-items";

type Portal = "live" | "judge";

export interface NavItem {
  href: string;
  label: string;
  featureFlagKey?: FeatureFlagKey;
}

export interface DropdownItem {
  href: string;
  label: string;
  description: string;
  external?: boolean;
  featureFlagKey?: FeatureFlagKey;
}

export interface DropdownConfig {
  label: string;
  items: DropdownItem[];
}

export interface PortalNavProps {
  tenant: TenantSlug;
  portal: Portal;
  dashboardPath: string;
  navItems: NavItem[];
  dropdowns: DropdownConfig[];
  isAuthorized: boolean;
  registerHref: string;
}

// Server Component shell: resolves tenant config + feature flags on the
// server and renders the logo. Active-link highlighting and the Radix
// dropdown interaction live in the `PortalNavItems` client island.
export const PortalNav = ({
  tenant,
  portal,
  dashboardPath,
  navItems,
  dropdowns,
  isAuthorized,
  registerHref,
}: PortalNavProps) => {
  const { config } = getTenant(tenant);
  const logo = config?.logo;
  const portalLabel = portal === "live" ? "Hacker" : "Judge";

  // Flags are compile-time constants (see `lib/feature-flags.ts`), so
  // filtering here is hydration-safe and identical on server + client.
  const visibleNavItems = navItems.filter(
    (item) => !item.featureFlagKey || getFeatureFlag(item.featureFlagKey),
  );
  const visibleDropdowns = dropdowns.map((dropdown) => ({
    ...dropdown,
    items: dropdown.items.filter(
      (item) => !item.featureFlagKey || getFeatureFlag(item.featureFlagKey),
    ),
  }));

  return (
    <nav className="mx-auto flex w-full max-w-4xl items-center justify-between gap-1">
      <Link href={`/${tenant}${dashboardPath}`} className="flex shrink-0 items-center gap-2">
        {logo && (
          <span className="flex items-center">
            <Image
              src={logo}
              alt="Logo"
              width={120}
              height={48}
              className="h-16 w-auto object-contain"
            />
          </span>
        )}
        {logo && (
          <span aria-hidden="true" className="text-lg text-muted-foreground">
            |
          </span>
        )}
        <span className="text-lg font-semibold text-foreground">{portalLabel}</span>
      </Link>

      <PortalNavItems
        tenant={tenant}
        navItems={visibleNavItems}
        dropdowns={visibleDropdowns}
        isAuthorized={isAuthorized}
        registerHref={registerHref}
      />
    </nav>
  );
};
