"use client";

import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import RulesMarkdown from "@/tenants/designverse/descriptions/rules.mdx";

interface RulesPageProps {
  tenant: string;
  baseHref?: string;
}

export function RulesPage({
  tenant,
  baseHref = `/${tenant}/live/dashboard`,
}: RulesPageProps) {
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
      <RulesMarkdown />
    </div>
  );
}
