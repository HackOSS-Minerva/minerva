import Template from "./template";
import { Text } from "@react-email/components";
import type { TenantConfig } from "@/lib/tenant-config";

interface ConfirmationProps {
  name: string;
  position: string;
  preview: string;
  tenant: TenantConfig;
}

const Confirmation = ({
  name,
  position,
  preview,
  tenant,
}: ConfirmationProps) => {
  return (
    <Template name={name} preview={preview} tenant={tenant}>
      <Text>
        Thank you for applying as a{" "}
        <strong>{position ?? "Insert Position"}</strong>!
      </Text>
      <Text>
        We appreciate your support towards {tenant.name}. Please keep an eye out
        for future {tenant.name} emails regarding updates and announcements.
      </Text>
    </Template>
  );
};

export default Confirmation;
