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
import { LiveNav } from "@/components/live/live-nav";

interface PackingListPageProps {
  tenant: string;
}

export function PackingListPage({ tenant }: PackingListPageProps) {
  return (
    <div className="mx-auto max-w-4xl space-y-6 px-4 py-6 md:py-10">
      <LiveNav tenant={tenant} />
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink href={`/${tenant}/live/dashboard`}>
              Dashboard
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbLink href={`/${tenant}/live/hackpacks`}>
              Resources
            </BreadcrumbLink>
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