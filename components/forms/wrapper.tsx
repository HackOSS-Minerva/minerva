"use client";

import { Card } from "@/components/ui/card";
import Footer from "@/components/forms/footer";
import Header from "@/components/forms/header";
import Fields from "./fields";
import { FormLockModal } from "./form-lock-modal";
import Image from "next/image";
import { slugs } from "@/hooks/use-fields";
import { useTenant } from "@/hooks/use-tenant";
import Status from "./status";

interface WrapperProps {
  form: slugs;
  tenant: string;
  userStatus?: "ACCEPTANCE" | "PENDING" | "REJECTION" | null;
}

const Wrapper = ({ form, tenant, userStatus }: WrapperProps) => {
  const {
    tenant: { logo, email: tenantEmail },
  } = useTenant();

  // Map database status to EmailType for the Status component.
  // Database uses "PENDING", Status component expects "CONFIRMATION".
  const statusForUI = userStatus === "PENDING" ? "CONFIRMATION" : userStatus;

  return (
    <>
      {logo && <Image src={logo} alt="logo" width={200} height={200} />}
      <FormLockModal form={form} />
      <Card className="w-full sm:max-w-md border-none">
        {statusForUI && statusForUI !== null ? (
          <Status
            status={statusForUI}
            form={form}
            tenant={tenant}
            tenantEmail={tenantEmail}
          />
        ) : (
          <>
            <Header />
            <Fields />
            <Footer />
          </>
        )}
      </Card>
    </>
  );
};

export default Wrapper;
