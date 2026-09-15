import { getPostHogAnalytics } from "@/lib/posthog";
import { getFeatureFlag } from "@/lib/feature-flags";

export async function GET(request: Request) {
  if (!getFeatureFlag("analytics")) {
    return Response.json(
      { error: "Analytics is not available" },
      { status: 403 },
    );
  }

  const tenant = new URL(request.url).searchParams.get("tenant");

  if (!tenant || !/^[a-z0-9-]+$/.test(tenant)) {
    return Response.json({ error: "Invalid tenant" }, { status: 400 });
  }

  try {
    return Response.json(await getPostHogAnalytics(tenant));
  } catch (error) {
    console.error("Failed to load PostHog analytics", error);
    return Response.json({ error: "Analytics unavailable" }, { status: 502 });
  }
}
