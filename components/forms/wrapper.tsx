import { Card } from "@/components/ui/card";
import Footer from "@/components/forms/footer";
import Header from "@/components/forms/header";
import Fields from "./fields";
import { FormLockModal } from "./form-lock-modal";
import { isFormSlug, type slugs } from "@/lib/form-defs";
import { getTenant, type TenantSlug } from "@/hooks/get-tenant";
import { notFound } from "next/navigation";
import Image from "next/image";
import Status from "./status";

interface WrapperProps {
  form: string;
  tenant: TenantSlug;
  userStatus?: "ACCEPTANCE" | "PENDING" | "REJECTION" | null;
}

// Server Component shell: logo + status branch render on the server.
// `Fields`/`Footer`/`FormLockModal` stay client islands — they self-resolve
// their form def via `useFields()` (useParams + mutations). `Header`/`Footer`
// additionally accept server-resolved props so they can SSR first.
const Wrapper = ({ form, tenant, userStatus }: WrapperProps) => {
  const {
    config: { logo, email: tenantEmail },
  } = getTenant(tenant);

  if (!isFormSlug(form)) notFound();
  const slug: slugs = form;

  // Map database status to EmailType for the Status component.
  // Database uses "PENDING", Status component expects "CONFIRMATION".
  const statusForUI = userStatus === "PENDING" ? "CONFIRMATION" : userStatus;

  return (
    <>
      {logo && <Image src={logo} alt="logo" width={100} height={100} />}
      <FormLockModal form={slug} />
      <Card className="w-full sm:max-w-md border-none">
        {statusForUI && statusForUI !== null ? (
          <Status
            status={statusForUI}
            form={slug}
            tenant={tenant}
            tenantEmail={tenantEmail}
          />
        ) : (
          <>
            <Header form={slug} tenant={tenant} />
            <Fields />
            <Footer form={slug} tenant={tenant} />
          </>
        )}
      </Card>
    </>
  );
};

export default Wrapper;
