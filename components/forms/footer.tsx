import { CardFooter } from "@/components/ui/card";
import { Field } from "@/components/ui/field";
import { Button } from "@/components/ui/button";
import { getFormDef, type slugs } from "@/lib/form-defs";
import type { TenantSlug } from "@/hooks/get-tenant";

interface FooterProps {
  form: slugs;
  tenant: TenantSlug;
}

// Server Component shell: the form id is static config.
const Footer = ({ form, tenant }: FooterProps) => {
  const {
    form: { metadata },
  } = getFormDef(form, tenant);

  return (
    <CardFooter>
      <Field orientation="horizontal" className="justify-center">
        <Button type="submit" form={metadata.id}>
          Submit
        </Button>
      </Field>
    </CardFooter>
  );
};

export default Footer;
