"use client";

import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { DevToolsContent } from "@/components/live/dev-tools/dev-tools-content";

interface DevToolsPageProps {
  tenant: string;
}

export function DevToolsPage({ tenant }: DevToolsPageProps) {
  return (
    <div className="space-y-6">
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
            <BreadcrumbPage>Dev Tools</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>
      <div className="mb-6">
        <h1 className="text-2xl font-bold md:text-3xl">Dev Tools</h1>
        <p className="mt-1 text-muted-foreground">
          Curated AI tools, editors, and services to help you build and ship
          your project.
        </p>
      </div>
      <DevToolsContent />
    </div>
  );
}
