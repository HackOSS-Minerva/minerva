"use client";

import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { LiveNav } from "@/components/live/live-nav";
import CodeOfConductMarkdown from "@/tenants/designverse/descriptions/code-of-conduct.mdx";

interface CodeOfConductPageProps {
  tenant: string;
}

export function CodeOfConductPage({ tenant }: CodeOfConductPageProps) {
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
      <CodeOfConductMarkdown />
    </div>
  );
}
