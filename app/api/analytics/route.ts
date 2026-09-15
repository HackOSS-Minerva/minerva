import { getPostHogAnalytics } from "@/lib/posthog";
import { AppError, requireFeature, withFetchHandler } from "@/lib/app-error";
import { getFeatureFlag } from "@/lib/feature-flags";

export const GET = withFetchHandler("analytics", async (request) => {
  requireFeature(getFeatureFlag("analytics"));

  const tenant = new URL(request.url).searchParams.get("tenant");

  if (!tenant || !/^[a-z0-9-]+$/.test(tenant)) {
    throw new AppError("TENANT_INVALID");
  }

  return Response.json(await getPostHogAnalytics(tenant));
});
