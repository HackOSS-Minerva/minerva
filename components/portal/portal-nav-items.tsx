"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { RiExternalLinkLine, RiLockLine } from "@remixicon/react";
import { cn } from "cn";
import type { TenantSlug } from "@/hooks/get-tenant";
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
} from "@/components/ui/navigation-menu";
import type { DropdownConfig, NavItem } from "@/components/portal/portal-nav";

interface PortalNavItemsProps {
  tenant: TenantSlug;
  navItems: NavItem[];
  dropdowns: DropdownConfig[];
  isAuthorized: boolean;
  registerHref: string;
}

function resolveHref(tenant: TenantSlug, href: string): string {
  if (href.startsWith("http://") || href.startsWith("https://")) {
    return href;
  }
  return `/${tenant}${href}`;
}

function isActiveDropdown(pathname: string, dropdown: DropdownConfig): boolean {
  return dropdown.items.some((item) => pathname.includes(item.href));
}

export function PortalNavItems({
  tenant,
  navItems,
  dropdowns,
  isAuthorized,
  registerHref,
}: PortalNavItemsProps) {
  const pathname = usePathname();

  return (
    <NavigationMenu>
      <NavigationMenuList>
        {navItems.map((item) => {
          const isActive = pathname.includes(item.href);
          return (
            <NavigationMenuItem key={item.href}>
              <NavigationMenuLink asChild active={isActive}>
                <Link
                  href={resolveHref(tenant, item.href)}
                  className={cn(isActive ? "bg-background" : "", "text-foreground")}
                >
                  {item.label}
                </Link>
              </NavigationMenuLink>
            </NavigationMenuItem>
          );
        })}

        {dropdowns.map((dropdown) => {
          const isActive = isActiveDropdown(pathname, dropdown);
          return (
            <NavigationMenuItem key={dropdown.label}>
              <NavigationMenuTrigger
                aria-disabled={!isAuthorized}
                className={cn(
                  "gap-1 transition-all",
                  isAuthorized && isActive ? "bg-background shadow-sm" : "",
                  isAuthorized ? "text-foreground" : "text-muted-foreground",
                  !isAuthorized && "opacity-60",
                )}
              >
                {!isAuthorized && <RiLockLine className="size-3.5" />}
                {dropdown.label}
              </NavigationMenuTrigger>
              <NavigationMenuContent>
                {isAuthorized ? (
                  <ul className="grid w-80 gap-1 p-2">
                    {dropdown.items.map((item) => (
                      <li key={item.href}>
                        <NavigationMenuLink asChild>
                          <Link
                            href={resolveHref(tenant, item.href)}
                            target={item.external ? "_blank" : undefined}
                            rel={item.external ? "noopener noreferrer" : undefined}
                            className="flex flex-col items-start gap-0.5"
                          >
                            <span className="flex items-center justify-between w-full gap-1 text-sm font-medium">
                              {item.label}
                              {item.external && (
                                <RiExternalLinkLine className="text-muted-foreground" />
                              )}
                            </span>
                            <span className="text-xs text-muted-foreground">
                              {item.description}
                            </span>
                          </Link>
                        </NavigationMenuLink>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <div className="min-w-55 p-2">
                    {dropdown.items.map((item) => (
                      <div
                        key={item.href}
                        className="flex flex-col items-start gap-0.5 px-2 py-1.5 opacity-50"
                      >
                        <span className="text-sm font-medium">{item.label}</span>
                        <span className="text-xs text-muted-foreground">{item.description}</span>
                      </div>
                    ))}
                    <div className="flex items-center justify-between gap-2 border-t px-2 py-2">
                      <span className="text-xs text-muted-foreground">Register to get access</span>
                      <Link
                        href={`/${tenant}${registerHref}`}
                        className="text-xs font-medium underline"
                      >
                        Register
                      </Link>
                    </div>
                  </div>
                )}
              </NavigationMenuContent>
            </NavigationMenuItem>
          );
        })}
      </NavigationMenuList>
    </NavigationMenu>
  );
}
