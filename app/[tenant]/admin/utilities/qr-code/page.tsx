import { AdminShell } from "@/components/dashboards/admin-shell";
import QRCodeGenerator from "@/components/admin/qr-code-generator";

const QRCodePage = () => {
  return (
    <AdminShell title="QR Code Generator">
      <QRCodeGenerator />
    </AdminShell>
  );
};

export default QRCodePage;
