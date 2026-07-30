"use client";

import { Card } from "@/components/ui/card";
import Footer from "@/components/forms/footer";
import Header from "@/components/forms/header";
import Fields from "./fields";
import { FormLockModal } from "./form-lock-modal";
import Image from "next/image";
import { slugs } from "@/hooks/use-fields";
import { useTenant } from "@/hooks/use-tenant";

interface WrapperProps {
  form: slugs;
  tenant: string;
}

const Wrapper = ({ form }: WrapperProps) => {
  const {
    tenant: { logo },
  } = useTenant();

  return (
    <>
      {logo && <Image src={logo} alt="logo" width={200} height={200} />}
      <FormLockModal form={form} />
      <Card className="w-full sm:max-w-md border-none">
        <Header />
        <Fields />
        <Footer />
      </Card>
    </>
  );
};

export default Wrapper;
