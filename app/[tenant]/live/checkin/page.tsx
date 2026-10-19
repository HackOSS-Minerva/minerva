import { CheckinPage } from "@/components/live/checkin/checkin-page";
import { guardParticipantPage } from "@/lib/require-participant";
import type { TenantSlug } from "@/hooks/get-tenant";

interface CheckinRouteProps {
  params: Promise<{
    tenant: TenantSlug;
  }>;
}

const CheckinRoute = async ({ params }: CheckinRouteProps) => {
  const { tenant } = await params;

  // Same guard as the navbar lock: signed-in accepted participants only.
  const locked = await guardParticipantPage(tenant, `/${tenant}/live/checkin`);
  if (locked) {
    return locked;
  }

  return <CheckinPage tenant={tenant} />;
};

export default CheckinRoute;
