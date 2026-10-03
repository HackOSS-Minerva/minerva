import Image from "next/image";
import Link from "next/link";
import { getTenant, type TenantSlug } from "@/hooks/get-tenant";
import { getFeatureFlag, type FeatureFlagKey } from "@/lib/feature-flags";
import { PortalNavItems } from "@/components/portal/portal-nav-items";

// ── Types ──────────────────────────────────────────────────────────────

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
  dashboardPath: string;
  navItems: NavItem[];
  dropdowns: DropdownConfig[];
  isAuthorized: boolean;
  registerHref: string;
}

// ── Helpers (shared with the `PortalNavItems` client island) ─────────────

// ── Component ──────────────────────────────────────────────────────────

// Server Component shell: resolves tenant config + feature flags on the
// server and renders the logo. Active-link highlighting and the Radix
// dropdown interaction live in the `PortalNavItems` client island.
export function PortalNav({
  tenant,
  dashboardPath,
  navItems,
  dropdowns,
  isAuthorized,
  registerHref,
}: PortalNavProps) {
  const { config } = getTenant(tenant);
  const logo = config?.logo;

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
    <nav className="flex items-center justify-between gap-1 w-full max-w-4xl mx-auto">
      {logo && (
        <Link href={`/${tenant}${dashboardPath}`} className="flex items-center">
          <Image
            src={logo}
            alt="Logo"
            width={120}
            height={48}
            className="h-16 w-auto object-contain"
          />
        </Link>
      )}

      <PortalNavItems
        tenant={tenant}
        navItems={visibleNavItems}
        dropdowns={visibleDropdowns}
        isAuthorized={isAuthorized}
        registerHref={registerHref}
      />
    </nav>
  );
}
