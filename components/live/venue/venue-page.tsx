"use client";

import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import VenueMarkdown from "@/tenants/designverse/descriptions/venue.mdx";

interface VenuePageProps {
  tenant: string;
  baseHref?: string;
}

export function VenuePage({
  tenant,
  baseHref = `/${tenant}/live/dashboard`,
}: VenuePageProps) {
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
      <VenueMarkdown />
    </div>
  );
}
