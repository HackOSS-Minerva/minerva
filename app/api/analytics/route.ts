import { getPostHogAnalytics } from "@/lib/posthog";

export async function GET(request: Request) {
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
