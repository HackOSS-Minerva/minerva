"use client";

import { api } from "@/convex/_generated/api";
import { useQuery } from "convex/react";
import { Card } from "@/components/ui/card";
import Footer from "@/components/forms/footer";
import Header from "@/components/forms/header";
import Fields from "./fields";
import Status from "@/components/forms/status";
import Image from "next/image";
import { slugs } from "@/hooks/use-fields";
import { useTenant } from "@/hooks/use-tenant";

interface WrapperProps {
  form: slugs;
  tenant: string;
}

const Wrapper = ({ form, tenant }: WrapperProps) => {
  const {
    tenant: { logo },
  } = useTenant();

  return (
    <>
      {logo && <Image src={logo} alt="logo" width={200} height={200} />}
      <Card className="w-full sm:max-w-md border-none">
        <Header />
        <Fields />
        <Footer />
      </Card>
    </>
  );
};

export default Wrapper;
