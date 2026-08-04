"use client";

import { usePathname } from "next/navigation";
import { useParams } from "next/navigation";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";

const resourcePaths: Record<string, string> = {
  "/judge/venue": "Venue",
  "/judge/packing-list": "Packing List",
  "/judge/rules": "Rules",
  "/judge/code-of-conduct": "Code of Conduct",
};

const participatePaths: Record<string, string> = {
  "/judge/assignments": "View Assignments",
  "/judge/submissions": "Project Submissions",
  "/judge/orientation": "Orientation",
  "/judge/certificate": "Certificate",
};

export function JudgeBreadcrumb() {
  const pathname = usePathname();
  const { tenant } = useParams<{ tenant: string }>();

  const dashboardHref = `/${tenant}/judge/dashboard`;

  const resourceKey = Object.keys(resourcePaths).find((k) =>
    pathname.includes(k),
  );
  const participateKey = Object.keys(participatePaths).find((k) =>
    pathname.includes(k),
  );

  if (resourceKey) {
    return (
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink href={dashboardHref}>Dashboard</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage className="text-muted-foreground font-normal">
              Resources
            </BreadcrumbPage>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>{resourcePaths[resourceKey]}</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>
    );
  }

  if (participateKey) {
    return (
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink href={dashboardHref}>Dashboard</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage className="text-muted-foreground font-normal">
              Participate
            </BreadcrumbPage>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>{participatePaths[participateKey]}</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>
    );
  }

  return null;
}
