import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { getTenant, type TenantSlug } from "@/hooks/get-tenant";

interface RulesPageProps {
  tenant: TenantSlug;
  baseHref?: string;
}

export function RulesPage({
  tenant,
  baseHref = `/${tenant}/live/dashboard`,
}: RulesPageProps) {
  const { markdown } = getTenant(tenant);
  const Markdown = markdown.rules;
  return (
    <div className="space-y-6">
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink href={baseHref}>Dashboard</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>Rules</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>
      <div>
        <h1 className="text-2xl font-bold md:text-3xl">Rules</h1>
        <p className="mt-1 text-muted-foreground">
          Review the hackathon rules and guidelines.
        </p>
      </div>
      <Markdown />
    </div>
  );
}
