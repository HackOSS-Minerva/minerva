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

  return (
    <div className="flex justify-center flex-col items-center gap-4">
      <Wrapper form={form} tenant={tenant} />
    </div>
  );
};

export default Form;
