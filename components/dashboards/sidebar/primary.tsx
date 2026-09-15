"use client";

import { type Icon } from "@tabler/icons-react";
import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { IconLock } from "@tabler/icons-react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { getTenant, type TenantSlug } from "@/hooks/get-tenant";

export function NavMain({
  label,
  items,
}: {
  label?: string;
  items: {
    title: string;
    url: string;
    slug?: string;
    icon?: Icon;
  }[];
}) {
  const { tenant } = useParams<{ tenant: TenantSlug }>();
  const { config } = getTenant(tenant);

  const rawAdminLocks = config?.locks?.admin;
  const adminLocks =
    rawAdminLocks &&
    typeof rawAdminLocks === "object" &&
    !Array.isArray(rawAdminLocks)
      ? (rawAdminLocks as Record<string, boolean>)
      : undefined;

  const isLocked = (slug?: string) =>
    slug !== undefined && adminLocks?.[slug] === true;

  return (
    <SidebarGroup>
      {label && <SidebarGroupLabel>{label}</SidebarGroupLabel>}
      <SidebarGroupContent className="flex flex-col gap-2">
        <SidebarMenu>
          {items.map((item) => {
            const locked = isLocked(item.slug);

            return (
              <SidebarMenuItem key={item.title}>
                <SidebarMenuButton asChild>
                  <Link
                    href={`/${tenant}${item.url}`}
                    aria-disabled={locked}
                    className={locked ? "pointer-events-none opacity-50" : ""}
                  >
                    {item.icon && <item.icon />}
                    <span>{item.title}</span>
                    {locked && <IconLock className="ml-auto h-3.5 w-3.5" />}
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            );
          })}
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  );
}
