import { tenantIdentifiers } from "../tenants/registry.ts";

export const allowedEventNames = new Set([
  "application_started",
  "application_submitted",
  "application_failed",
  "checkin_completed",
  "checkin_failed",
  "submission_started",
  "submission_completed",
  "submission_failed",
  "dashboard_viewed",
] as const);

export type AnalyticsEventName =
  | "application_started"
  | "application_submitted"
  | "application_failed"
  | "checkin_completed"
  | "checkin_failed"
  | "submission_started"
  | "submission_completed"
  | "submission_failed"
  | "dashboard_viewed";

export type AnalyticsProperties = Partial<{
  tenant: string;
  role: "judge" | "participant" | "speaker" | "superadmin" | "volunteer" | "sponsor" | "visitor";
  form: "judge" | "participant" | "speaker" | "superadmin" | "volunteer" | "submission";
  dashboard:
    | "live"
    | "judge"
    | "sponsor"
    | "admin_analytics"
    | "judge_analytics"
    | "sponsor_analytics";
  reason: "mutation_failed";
}>;

type Capture = (name: AnalyticsEventName, properties: AnalyticsProperties) => void;

type AnalyticsPropertyKey = keyof AnalyticsProperties;

export const allowedTenantIdentifiers = new Set(tenantIdentifiers);
const allowedRoles = new Set([
  "judge",
  "participant",
  "speaker",
  "superadmin",
  "volunteer",
  "sponsor",
  "visitor",
]);
const allowedForms = new Set([
  "judge",
  "participant",
  "speaker",
  "superadmin",
  "volunteer",
  "submission",
]);
const allowedDashboards = new Set([
  "live",
  "judge",
  "sponsor",
  "admin_analytics",
  "judge_analytics",
  "sponsor_analytics",
]);
const allowedReasons = new Set(["mutation_failed"]);

const allowedPropertiesByEvent: Record<AnalyticsEventName, readonly AnalyticsPropertyKey[]> = {
  application_started: ["tenant", "role", "form"],
  application_submitted: ["tenant", "role", "form"],
  application_failed: ["tenant", "role", "form", "reason"],
  checkin_completed: ["tenant", "role"],
  checkin_failed: ["tenant", "role", "reason"],
  submission_started: ["tenant", "form"],
  submission_completed: ["tenant", "form"],
  submission_failed: ["tenant", "form", "reason"],
  dashboard_viewed: ["tenant", "role", "dashboard"],
};

const requiredPropertiesByEvent: Partial<
  Record<AnalyticsEventName, readonly AnalyticsPropertyKey[]>
> = {
  dashboard_viewed: ["tenant", "role", "dashboard"],
};

const hasAllowedValue = (key: AnalyticsPropertyKey, value: unknown): value is string => {
  if (typeof value !== "string") return false;

  switch (key) {
    case "tenant":
      return allowedTenantIdentifiers.has(value);
    case "role":
      return allowedRoles.has(value);
    case "form":
      return allowedForms.has(value);
    case "dashboard":
      return allowedDashboards.has(value);
    case "reason":
      return allowedReasons.has(value);
  }
};

const sanitizeProperties = (
  name: AnalyticsEventName,
  properties: Record<string, unknown>,
): AnalyticsProperties | undefined => {
  if (!hasAllowedValue("tenant", properties.tenant)) return;

  const safeProperties: Record<string, string> = {};

  for (const key of allowedPropertiesByEvent[name]) {
    const value = properties[key];
    if (hasAllowedValue(key, value)) {
      safeProperties[key] = value;
    }
  }

  if (requiredPropertiesByEvent[name]?.some((key) => !(key in safeProperties))) {
    return;
  }

  return safeProperties as AnalyticsProperties;
};

export const createAnalyticsClient = (capture?: Capture) => ({
  capture(name: AnalyticsEventName, properties: Record<string, unknown>) {
    if (!capture || !allowedEventNames.has(name)) return;
    const safeProperties = sanitizeProperties(name, properties);
    if (!safeProperties) return;
    capture(name, safeProperties);
  },
});

type QueuedEvent = { name: AnalyticsEventName; properties: AnalyticsProperties };

export const createQueuedAnalyticsClient = () => {
  let capture: Capture | undefined;
  const queued: QueuedEvent[] = [];

  return {
    capture(name: AnalyticsEventName, properties: Record<string, unknown>) {
      if (!allowedEventNames.has(name)) return;
      const safeProperties = sanitizeProperties(name, properties);
      if (!safeProperties) return;

      if (capture) {
        capture(name, safeProperties);
        return;
      }

      queued.push({ name, properties: safeProperties });
    },
    setCapture(nextCapture: Capture) {
      capture = nextCapture;
      for (const event of queued.splice(0)) {
        capture(event.name, event.properties);
      }
    },
  };
};

const analytics = createQueuedAnalyticsClient();
let initialization: Promise<void> | undefined;

const hasAnalyticsConfig = () =>
  typeof window !== "undefined" && Boolean(process.env.NEXT_PUBLIC_POSTHOG_KEY);

export const posthogOptions = {
  api_host: "/ingest",
  ui_host: "https://us.posthog.com",
  defaults: "2025-05-24" as const,
  autocapture: false,
  capture_pageview: false,
  capture_pageleave: false,
  capture_exceptions: false,
  disable_session_recording: true,
  capture_performance: false,
  capture_dead_clicks: false,
  capture_heatmaps: false,
  disable_surveys: true,
  disable_external_dependency_loading: true,
};

export const initializeAnalytics = async () => {
  const key = process.env.NEXT_PUBLIC_POSTHOG_KEY;
  if (!hasAnalyticsConfig() || !key) return;

  if (initialization) return initialization;

  initialization = (async () => {
    const { default: posthog } = await import("posthog-js");

    posthog.init(key, {
      ...posthogOptions,
      ui_host: process.env.NEXT_PUBLIC_POSTHOG_HOST || "https://us.posthog.com",
      debug: process.env.NODE_ENV === "development",
    });

    analytics.setCapture((name, properties) => posthog.capture(name, properties));
  })();

  return initialization;
};

export const captureAnalyticsEvent = (
  name: AnalyticsEventName,
  properties: AnalyticsProperties,
) => {
  if (!hasAnalyticsConfig()) return;
  analytics.capture(name, properties);
};

export const trackApplicationStarted = (properties: Pick<AnalyticsProperties, "tenant" | "role" | "form">) =>
  captureAnalyticsEvent("application_started", properties);

export const trackApplicationSubmitted = (properties: Pick<AnalyticsProperties, "tenant" | "role" | "form">) =>
  captureAnalyticsEvent("application_submitted", properties);

export const trackCheckinCompleted = (properties: Pick<AnalyticsProperties, "tenant" | "role">) =>
  captureAnalyticsEvent("checkin_completed", properties);

export const trackSubmissionStarted = (properties: Pick<AnalyticsProperties, "tenant" | "form">) =>
  captureAnalyticsEvent("submission_started", properties);

export const trackSubmissionCompleted = (properties: Pick<AnalyticsProperties, "tenant" | "form">) =>
  captureAnalyticsEvent("submission_completed", properties);

export const trackDashboardViewed = (properties: Pick<AnalyticsProperties, "tenant" | "role" | "dashboard">) =>
  captureAnalyticsEvent("dashboard_viewed", properties);
