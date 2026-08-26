"use client";

import { AnalyticsPage as SharedAnalyticsPage } from "@/components/analytics/analytics-page";
import { FormLockModal } from "@/components/forms/form-lock-modal";

interface SponsorAnalyticsPageProps {
  tenant: string;
}

export function AnalyticsPage({ tenant }: SponsorAnalyticsPageProps) {
  return (
    <>
      <FormLockModal form="sponsor-analytics" />
      <SharedAnalyticsPage tenant={tenant} scope="shared" />
    </>
  );
}
