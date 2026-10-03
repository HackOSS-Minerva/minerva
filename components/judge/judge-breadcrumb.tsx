import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import type { TenantSlug } from "@/hooks/get-tenant";

const resourcePaths: Record<string, string> = {
  "/judge/venue": "Venue",
  "/judge/rules": "Rules",
  "/judge/code-of-conduct": "Code of Conduct",
};

const participatePaths: Record<string, string> = {
  "/judge/assignments": "View Assignments",
  "/judge/submissions": "Project Submissions",
  "/judge/certificate": "Certificate",
};

interface JudgeBreadcrumbProps {
  tenant: TenantSlug;
  /** Current page label, e.g. "Certificate". */
  page: string;
  /** Breadcrumb section: "Resources" or "Participate". */
  section: "Resources" | "Participate";
}

// Server Component: the page route passes `tenant` + labels explicitly, so
// no `usePathname()`/`useParams()` client hooks are needed.
export function JudgeBreadcrumb({
  tenant,
  page,
  section,
}: JudgeBreadcrumbProps) {
  const dashboardHref = `/${tenant}/judge/dashboard`;

  return (
    <Breadcrumb>
      <BreadcrumbList>
        <BreadcrumbItem>
          <BreadcrumbLink href={dashboardHref}>Dashboard</BreadcrumbLink>
        </BreadcrumbItem>
        <BreadcrumbSeparator />
        <BreadcrumbItem>
          <BreadcrumbPage className="text-muted-foreground font-normal">
            {section}
          </BreadcrumbPage>
        </BreadcrumbItem>
        <BreadcrumbSeparator />
        <BreadcrumbItem>
          <BreadcrumbPage>{page}</BreadcrumbPage>
        </BreadcrumbItem>
      </BreadcrumbList>
    </Breadcrumb>
  );
}

// Lookup helper for pages that still resolve the breadcrumb from a path.
// Prefer passing `tenant`/`page`/`section` directly from the server route.
export function resolveJudgeBreadcrumb(pathname: string): {
  page: string;
  section: "Resources" | "Participate";
} | null {
  const resourceKey = Object.keys(resourcePaths).find((k) =>
    pathname.includes(k),
  );
  if (resourceKey) {
    return { page: resourcePaths[resourceKey], section: "Resources" };
  }
  const participateKey = Object.keys(participatePaths).find((k) =>
    pathname.includes(k),
  );
  if (participateKey) {
    return { page: participatePaths[participateKey], section: "Participate" };
  }
  return null;
}
