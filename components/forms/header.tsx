import { CardHeader } from "@/components/ui/card";
import { getFormDef, type slugs } from "@/lib/form-defs";
import type { TenantSlug } from "@/hooks/get-tenant";

interface HeaderProps {
  form: slugs;
  tenant: TenantSlug;
}

// Server Component: the per-form `Header` MDX is static content resolved via
// the pure `getFormDef()` lookup — no `useFields()` (useParams) needed.
const Header = ({ form, tenant }: HeaderProps) => {
  const {
    metadata: { Header: FormHeader },
  } = getFormDef(form, tenant);

  return (
    <CardHeader>
      <div className="px-4">
        <FormHeader />
      </div>
    </CardHeader>
  );
};

export default Header;
