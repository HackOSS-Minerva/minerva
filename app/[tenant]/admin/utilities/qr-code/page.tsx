import { FeatureGateModal } from "@/components/feature-flags/feature-gate-modal";
import { AdminShell } from "@/components/dashboards/admin-shell";
import QRCodeGenerator from "@/components/admin/qr-code-generator";
import { getAdminPageLock } from "@/lib/admin-locks";
import type { TenantSlug } from "@/hooks/get-tenant";

export default async function QRCodePage({
  params,
}: {
  params: Promise<{
    tenant: TenantSlug;
  }>;
}) {
  const { tenant } = await params;

  return (
    <AdminShell title="QR Code Generator">
      {getAdminPageLock(tenant, "qr-code") ? (
        <FeatureGateModal reason="locked" />
      ) : (
        <QRCodeGenerator />
      )}
    </AdminShell>
  );
}
