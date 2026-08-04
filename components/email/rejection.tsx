import Template from "./template";
import { Text } from "@react-email/components";
import type { TenantConfig } from "@/lib/tenant-config";

interface RejectionProps {
  name: string;
  position: string;
  preview: string;
  tenant: TenantConfig;
}

const Rejection = ({ name, position, preview, tenant }: RejectionProps) => {
  return (
    <Template name={name} preview={preview} tenant={tenant}>
      <Text>
        Thank you for applying to {tenant.name} as a{" "}
        {position ?? "Insert Position"}. Unfortunately, due to particular
        circumstances we are unable to provide you a spot at {tenant.name}.
      </Text>
      <Text>
        However, we loved getting to know you and hope that you apply next year.
        If you have any questions, please reach out at {tenant.email}
      </Text>
    </Template>
  );
};

export default Rejection;
