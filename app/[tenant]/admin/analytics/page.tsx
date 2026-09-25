import type { CSSProperties } from "react";
import { AnalyticsPage } from "@/components/analytics/analytics-page";
import { FeatureGateModal } from "@/components/feature-flags/feature-gate-modal";
import { AppSidebar } from "@/components/dashboards/sidebar";
import { SiteHeader } from "@/components/dashboards/header";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { getAdminPageLock } from "@/lib/admin-locks";
import { getFeatureFlag } from "@/lib/feature-flags";
import type { TenantSlug } from "@/hooks/get-tenant";

export default async function AdminAnalyticsPage({
  params,
}: {
  params: Promise<{
    tenant: TenantSlug;
  }>;
}) {
  const { tenant } = await params;

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
        <SiteHeader>Analytics</SiteHeader>
        <div className="flex flex-1 flex-col">
          <div className="@container/main flex flex-1 flex-col gap-2">
            <div className="flex flex-col gap-4 px-4 py-4 md:gap-6 md:py-6 lg:px-6">
              {!getFeatureFlag("analytics") ? (
                <FeatureGateModal reason="disabled" />
              ) : getAdminPageLock(tenant, "analytics") ? (
                <FeatureGateModal reason="locked" />
              ) : (
                <AnalyticsPage tenant={tenant} scope="admin" />
              )}
            </div>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
