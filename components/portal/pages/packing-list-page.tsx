import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { PackingChecklist } from "@/components/portal/pages/packing-checklist";
import type { TenantSlug } from "@/hooks/get-tenant";

interface PackingListPageProps {
  tenant: TenantSlug;
  baseHref?: string;
}
export const PackingListPage = ({
  tenant,
  baseHref = `/${tenant}/live/dashboard`,
}: PackingListPageProps) => {

}>Dashboard</BreadcrumbLink>
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
