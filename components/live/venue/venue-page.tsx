import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { getTenant, type TenantSlug } from "@/hooks/get-tenant";

interface VenuePageProps {
  tenant: TenantSlug;
  baseHref?: string;
}

export function VenuePage({
  tenant,
  baseHref = `/${tenant}/live/dashboard`,
}: VenuePageProps) {
  const { markdown } = getTenant(tenant);
  const Markdown = markdown.venue;
  return (
    <div className="space-y-6">
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink href={baseHref}>Dashboard</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>Venue</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>
      <div>
        <h1 className="text-2xl font-bold md:text-3xl">Venue</h1>
        <p className="mt-1 text-muted-foreground">
          Find location and event details.
        </p>
      </div>
      <Markdown />
    </div>
  );
}
