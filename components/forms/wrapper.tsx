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

const GET_STATUSES = {
  participant: api.participants.getstatus,
  judge: api.judges.getstatus,
  speaker: api.speakers.getstatus,
  superadmin: api.superadmins.getstatus,
  volunteer: api.volunteers.getstatus,
} as const;

interface WrapperProps {
  form: slugs;
  tenant: string;
  user: {
    id: string;
  };
}

const Wrapper = ({ form, tenant, user }: WrapperProps) => {
  const status = useQuery(GET_STATUSES[form], {
    tenant: tenant.toLowerCase(),
    workos: user.id,
  });

  const {
    tenant: { logo },
  } = useTenant();

  if (status === undefined) return null;

  return (
    <>
      <Image src={logo} alt="logo" width={200} height={200} />
      {status ? (
        <Status status={status} />
      ) : (
        <Card className="w-full sm:max-w-md border-none">
          <Header />
          <Fields />
          <Footer />
        </Card>
      )}
    </>
  );
};

export default Wrapper;
