import { withAuth } from "@workos-inc/authkit-nextjs";
import { redirect } from "next/navigation";
import Wrapper from "./wrapper";
import { slugs } from "@/hooks/use-fields";

interface FormProps {
  params: {
    tenant: string;
    form: slugs;
  };
}

const Form = async ({ params }: FormProps) => {
  const { tenant, form } = await params;
  const { user } = await withAuth();

  if (user === null) redirect("/login");

  return (
    <div className="flex justify-center flex-col items-center gap-4">
      <Wrapper form={form} tenant={tenant} user={user} />
    </div>
  );
};

export default Form;
