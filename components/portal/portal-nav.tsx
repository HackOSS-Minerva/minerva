"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronDownIcon, ExternalLink, Lock } from "lucide-react";
import { cn } from "@/lib/utils";
import { getTenant, type TenantSlug } from "@/hooks/get-tenant";
import { useFeatureFlag } from "@/hooks/use-feature-flags";
import type { FeatureFlagKey } from "@/lib/feature-flags";
import { Button, buttonVariants } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

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

// ── Helpers ────────────────────────────────────────────────────────────

function resolveHref(tenant: TenantSlug, href: string): string {
  if (href.startsWith("http://") || href.startsWith("https://")) {
    return href;
  }
  if (href.startsWith("/forms")) {
    return `/${tenant}${href}`;
  }
  return `/${tenant}${href}`;
}

function isActiveDropdown(pathname: string, dropdown: DropdownConfig): boolean {
  return dropdown.items.some((item) => pathname.includes(item.href));
}

// ── Component ──────────────────────────────────────────────────────────

export function PortalNav({
  tenant,
  dashboardPath,
  navItems,
  dropdowns,
  isAuthorized,
  registerHref,
}: PortalNavProps) {
  const pathname = usePathname();
  const { config } = getTenant(tenant);
  const logo = config?.logo;

  // Collect all feature flag keys used across nav items and dropdown items
  const flagKeys: FeatureFlagKey[] = [
    ...new Set(
      [...navItems, ...dropdowns.flatMap((d) => d.items)]
        .map((item) => item.featureFlagKey)
        .filter((key): key is FeatureFlagKey => key !== undefined)
        .sort(),
    ),
  ];

  const enabled: Record<FeatureFlagKey, boolean> = {} as Record<
    FeatureFlagKey,
    boolean
  >;
  for (const key of flagKeys) {
    enabled[key] = useFeatureFlag(key).isEnabled;
  }

  const visibleNavItems = navItems.filter(
    (item) => !item.featureFlagKey || enabled[item.featureFlagKey],
  );
  const visibleDropdowns = dropdowns.map((dropdown) => ({
    ...dropdown,
    items: dropdown.items.filter(
      (item) => !item.featureFlagKey || enabled[item.featureFlagKey],
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

      <div className="flex items-center gap-1">
        {/* Top-level nav items */}
        {visibleNavItems.map((item) => {
          const isActive = pathname.includes(item.href);
          return (
            <Link
              key={item.href}
              href={resolveHref(tenant, item.href)}
              className={cn(
                buttonVariants({ variant: "ghost", size: "sm" }),
                isActive ? "bg-background" : "",
                "text-foreground",
                "transition-all",
              )}
            >
              {item.label}
            </Link>
          );
        })}

        {/* Dropdown menus */}
        {visibleDropdowns.map((dropdown) => {
          const isActive = isActiveDropdown(pathname, dropdown);
          return (
            <DropdownMenu key={dropdown.label}>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  aria-disabled={!isAuthorized}
                  className={cn(
                    "gap-1 transition-all",
                    isAuthorized && isActive ? "bg-background shadow-sm" : "",
                    isAuthorized ? "text-foreground" : "text-muted-foreground",
                    !isAuthorized && "opacity-60",
                  )}
                >
                  {!isAuthorized && <Lock className="size-3.5" />}
                  {dropdown.label}
                  <ChevronDownIcon className="size-3 opacity-60" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="center">
                {isAuthorized ? (
                  dropdown.items.map((item) => (
                    <DropdownMenuItem key={item.href} asChild>
                      <Link
                        href={resolveHref(tenant, item.href)}
                        target={item.external ? "_blank" : undefined}
                        rel={item.external ? "noopener noreferrer" : undefined}
                        className="flex flex-col items-start gap-0.5"
                      >
                        <span className="flex items-center justify-between w-full gap-1 text-sm font-medium">
                          {item.label}
                          {item.external && (
                            <ExternalLink className="text-muted-foreground" />
                          )}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          {item.description}
                        </span>
                      </Link>
                    </DropdownMenuItem>
                  ))
                ) : (
                  <div className="min-w-[220px]">
                    {dropdown.items.map((item) => (
                      <div
                        key={item.href}
                        className="flex flex-col items-start gap-0.5 px-2 py-1.5 opacity-50"
                      >
                        <span className="text-sm font-medium">
                          {item.label}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          {item.description}
                        </span>
                      </div>
                    ))}
                    <div className="flex items-center justify-between gap-2 border-t px-2 py-2">
                      <span className="text-xs text-muted-foreground">
                        Register to get access
                      </span>
                      <Button asChild size="sm" variant="outline">
                        <Link href={`/${tenant}${registerHref}`}>Register</Link>
                      </Button>
                    </div>
                  </div>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          );
        })}
      </div>
    </nav>
  );
}
