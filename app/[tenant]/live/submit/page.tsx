import { SubmissionFormPage } from "@/components/live/submit/submission-form-page";
import { guardParticipantPage } from "@/lib/require-participant";
import type { TenantSlug } from "@/hooks/get-tenant";

interface SubmitRouteProps {
  params: Promise<{
    tenant: TenantSlug;
  }>;
}

const SubmitRoute = async ({ params }: SubmitRouteProps) => {
  const { tenant } = await params;

  // Secure check (the proxy only does an optimistic cookie redirect): requires
  // a signed-in accepted participant. Unlocked in dev.
  const locked = await guardParticipantPage(tenant, `/${tenant}/live/submit`);
  if (locked) {
    return locked;
  }

  return <SubmissionFormPage tenant={tenant} />;
};

export default SubmitRoute;
