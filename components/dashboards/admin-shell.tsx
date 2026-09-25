import type { CSSProperties, ReactNode } from "react";
import { AppSidebar } from "@/components/dashboards/sidebar";
import { SiteHeader } from "@/components/dashboards/header";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";

interface AdminShellProps {
  title: ReactNode;
  children: ReactNode;
}

/**
 * Shared chrome + content spacing for every /admin page.
 *
 * This is the single source of truth for admin content padding
 * (`px-4 py-4 md:py-6 lg:px-6`). Pages must not add their own outer
 * px/py/mx wrappers, and inner content components must not add
 * horizontal page padding either — otherwise we get double-padding on
 * some pages and zero-padding on others (the assignments bug).
 */
export function AdminShell({ title, children }: AdminShellProps) {
  return (
    <SidebarProvider
      style={
        {
          "--sidebar-width": "calc(var(--spacing) * 72)",
          "--header-height": "calc(var(--spacing) * 12)",
        } as CSSProperties
      }
    >
      <AppSidebar variant="inset" />
      <SidebarInset>
        <SiteHeader>{title}</SiteHeader>
        <div className="flex flex-1 flex-col">
          <div className="@container/main flex flex-1 flex-col gap-2">
            <div className="flex flex-col gap-4 px-4 py-4 md:gap-6 md:py-6 lg:px-6">
              {children}
            </div>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
