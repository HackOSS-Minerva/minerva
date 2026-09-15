import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { getTenant, type TenantSlug } from "@/hooks/get-tenant";

interface CodeOfConductPageProps {
  tenant: TenantSlug;
  baseHref?: string;
}

export function CodeOfConductPage({
  tenant,
  baseHref = `/${tenant}/live/dashboard`,
}: CodeOfConductPageProps) {
  const { markdown } = getTenant(tenant);
  const Markdown = markdown.codeOfConduct;
  return (
    <div className="space-y-6">
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink href={baseHref}>Dashboard</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>Code of Conduct</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>
      <div>
        <h1 className="text-2xl font-bold md:text-3xl">Code of Conduct</h1>
        <p className="mt-1 text-muted-foreground">
          Understand our community standards.
        </p>
      </div>
      <Markdown />
    </div>
  );
}
