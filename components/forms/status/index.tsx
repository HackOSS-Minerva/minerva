import { EmailType } from "@/types/email";
import Accepted from "./accepted";
import Rejected from "./rejected";
import Pending from "./pending";
import type { TenantSlug } from "@/hooks/get-tenant";

interface StatusProps {
  status: EmailType;
  form: string;
  tenant: TenantSlug;
  tenantEmail: string;
}

const Status = ({ status, form, tenant, tenantEmail }: StatusProps) => {
  switch (status) {
    case "ACCEPTANCE":
      return <Accepted form={form} tenant={tenant} />;
    case "REJECTION":
      return <Rejected tenantEmail={tenantEmail} />;
    case "CONFIRMATION":
      return <Pending />;
    default:
      return <Pending />;
  }
};

export default Status;
