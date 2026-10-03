import { CardFooter } from "@/components/ui/card";
import { Field } from "@/components/ui/field";
import { Button } from "@/components/ui/button";
import { SubmitLockButton } from "@/components/forms/submit-lock-button";
import { getFormDef, type slugs } from "@/lib/form-defs";
import type { TenantSlug } from "@/hooks/get-tenant";

interface FooterProps {
  form: slugs;
  tenant: TenantSlug;
}

// Server Component shell: the form id is static config. Lock state
// (`useFormLock`) lives in the `SubmitLockButton` client island.
const Footer = ({ form, tenant }: FooterProps) => {
  const {
    form: { metadata },
  } = getFormDef(form, tenant);

  return (
    <CardFooter>
      <Field orientation="horizontal" className="justify-center">
        <SubmitLockButton form={form} formId={metadata.id} />
        {/* Fallback for no-JS / pre-hydration: replaced once the island loads. */}
        <noscript>
          <Button type="submit" form={metadata.id}>
            Submit
          </Button>
        </noscript>
      </Field>
    </CardFooter>
  );
};

export default Footer;
