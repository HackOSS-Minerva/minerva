"use client";

import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { DataTable } from "@/components/dashboards/datatable";
import * as submissions from "@/components/dashboards/dashboards/submissions";
import { FormLockModal } from "@/components/forms/form-lock-modal";
import { getTenant, type TenantSlug } from "@/hooks/get-tenant";

interface JudgeSubmissionsDashboardProps {
  tenant: TenantSlug;
}

export function JudgeSubmissionsDashboard({
  tenant,
}: JudgeSubmissionsDashboardProps) {
  const { config } = getTenant(tenant);
  const tenantName = config.slug.toLowerCase();
  const data = useQuery(api.submissions.get, { tenant: tenantName });

  if (data === undefined) return <div>Loading...</div>;

  return (
    <>
      <FormLockModal form="judge-submissions" />
      <div className="space-y-6">
        <div className="flex flex-col gap-1">
          <h1 className="text-2xl font-bold">Project Submissions</h1>
          <p className="text-sm text-muted-foreground">
            Browse all submitted team projects, demo links, and resources.
          </p>
        </div>

        <DataTable
          dashboard={{ data, dashboard: submissions }}
          slugOverride="submissions"
          readOnly
        />
      </div>
    </>
  );
}
