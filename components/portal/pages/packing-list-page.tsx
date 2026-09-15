"use client";

import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { PackingChecklist } from "@/components/live/dashboard/packing-checklist";

interface PackingListPageProps {
  tenant: string;
  baseHref?: string;
}

export function PackingListPage({
  tenant,
  baseHref = `/${tenant}/live/dashboard`,
}: PackingListPageProps) {
  return (
    <div className="space-y-6">
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink href={baseHref}>Dashboard</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>Packing List</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>
      <div>
        <h1 className="text-2xl font-bold md:text-3xl">Packing List</h1>
        <p className="mt-1 text-muted-foreground">
          Make sure you have everything you need for the event.
        </p>
      </div>

      <PackingChecklist tenant={tenant} />
    </div>
  );
}
