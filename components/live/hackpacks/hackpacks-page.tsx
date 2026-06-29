"use client";

import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { HackpacksContent } from "@/components/live/hackpacks/hackpacks-content";
import { LiveNav } from "@/components/live/live-nav";

interface HackpacksPageProps {
  tenant: string;
}

export function HackpacksPage({ tenant }: HackpacksPageProps) {
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
            <BreadcrumbPage>Hackpacks</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>
      <div className="mb-6">
        <h1 className="text-2xl font-bold md:text-3xl">Hackpacks</h1>
        <p className="mt-1 text-muted-foreground">
          Explore sponsor resources, APIs, and tools to help build your project.
        </p>
      </div>
      <HackpacksContent />
    </div>
  );
}
