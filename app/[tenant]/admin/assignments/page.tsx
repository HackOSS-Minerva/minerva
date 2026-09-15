import { FeatureGateModal } from "@/components/feature-flags/feature-gate-modal";
import { AppSidebar } from "@/components/dashboards/sidebar";
import { SiteHeader } from "@/components/dashboards/header";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import AssignmentsContent from "@/components/admin/assignments-page";
import { getAdminPageLock } from "@/lib/admin-locks";
import { getFeatureFlag } from "@/lib/feature-flags";
import type { TenantSlug } from "@/hooks/get-tenant";

export default async function AssignmentsPage({
  params,
}: {
  params: Promise<{
    tenant: TenantSlug }>;
}) {
  const { tenant } = await params;

  return (
    <SidebarProvider
      style={
        {
          "--sidebar-width": "calc(var(--spacing) * 72)",
          "--header-height": "calc(var(--spacing) * 12)",
        } as React.CSSProperties
      }
    >
      <AppSidebar variant="inset" />
      <SidebarInset>
        <SiteHeader>Assignments</SiteHeader>
        <div className="flex flex-1 flex-col">
          <div className="@container/main flex flex-1 flex-col gap-2">
            <div className="flex py-4 md:gap-6 md:py-6">
              {!getFeatureFlag("assignments") ? (
                <div className="w-full">
                  <FeatureGateModal reason="disabled" />
                </div>
              ) : getAdminPageLock(tenant, "assignments") ? (
                <div className="w-full">
                  <FeatureGateModal reason="locked" />
                </div>
              ) : (
                <AssignmentsContent />
              )}
            </div>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
