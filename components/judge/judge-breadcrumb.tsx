import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import type { TenantSlug } from "@/hooks/get-tenant";

interface JudgeBreadcrumbProps {
  tenant: TenantSlug;
  /** Current page label, e.g. "Certificate". */
  page: string;
  /** Breadcrumb section: "Resources" or "Participate". */
  section: "Resources" | "Participate";
}

// Server Component: the page route passes `tenant` + labels explicitly, so
// no `usePathname()`/`useParams()` client hooks are needed.
export const JudgeBreadcrumb = ({ tenant, page, section }: JudgeBreadcrumbProps) => {
  const dashboardHref = `/${tenant}/judge/dashboard`;

  return (
    <Breadcrumb>
      <BreadcrumbList>
        <BreadcrumbItem>
          <BreadcrumbLink href={dashboardHref}>Dashboard</BreadcrumbLink>
        </BreadcrumbItem>
        <BreadcrumbSeparator />
        <BreadcrumbItem>
          <BreadcrumbPage className="font-normal text-muted-foreground">{section}</BreadcrumbPage>
        </BreadcrumbItem>
        <BreadcrumbSeparator />
        <BreadcrumbItem>
          <BreadcrumbPage>{page}</BreadcrumbPage>
        </BreadcrumbItem>
      </BreadcrumbList>
    </Breadcrumb>
  );
};
