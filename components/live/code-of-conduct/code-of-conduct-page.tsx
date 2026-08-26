"use client";

import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { useTenant } from "@/hooks/use-tenant";

interface CodeOfConductPageProps {
  tenant: string;
  baseHref?: string;
}

export function CodeOfConductPage({
  tenant,
  baseHref = `/${tenant}/live/dashboard`,
}: CodeOfConductPageProps) {
  const { markdown } = useTenant();
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
