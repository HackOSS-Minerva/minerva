import { AdminShell } from "@/components/dashboards/admin-shell";
import QRCodeGenerator from "@/components/admin/qr-code-generator";

export default async function QRCodePage() {
  return (
    <AdminShell title="QR Code Generator">
      <QRCodeGenerator />
    </AdminShell>
  );
}
