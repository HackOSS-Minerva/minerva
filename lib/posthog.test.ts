import assert from "node:assert/strict";
import test from "node:test";

import {
  allowedTenantIdentifiers,
  createAnalyticsClient,
  createQueuedAnalyticsClient,
  posthogOptions,
} from "./posthog.ts";
import { tenantConfigByIdentifier } from "../tenants/registry.ts";

const [configuredTenant] = Object.keys(tenantConfigByIdentifier);

if (!configuredTenant) {
  throw new Error("Tenant registry must include at least one tenant");
}

test("drops events when the analytics client is unavailable", () => {
  const analytics = createAnalyticsClient();

  assert.doesNotThrow(() => {
    analytics.capture("application_submitted", {
      tenant: configuredTenant,
      role: "participant",
    });
  });
});

test("captures only allowlisted event properties", () => {
  const captured: unknown[] = [];
  const analytics = createAnalyticsClient((name, properties) =>
    captured.push({ name, properties }),
  );

  analytics.capture("application_submitted", {
    tenant: configuredTenant,
    role: "participant",
    email: "private@example.com",
  });

  assert.deepEqual(captured, [
    {
      name: "application_submitted",
      properties: { tenant: configuredTenant, role: "participant" },
    },
  ]);
});

test("drops events without a valid tenant", () => {
  const captured: unknown[] = [];
  const analytics = createAnalyticsClient((name, properties) =>
    captured.push({ name, properties }),
  );

  analytics.capture("application_submitted", {
    role: "participant",
    form: "participant",
  });
  analytics.capture("application_submitted", {
    tenant: "unknown-tenant",
    role: "participant",
    form: "participant",
  });

  assert.deepEqual(captured, []);
});

test("keeps only canonical values for an event's supported properties", () => {
  const captured: unknown[] = [];
  const analytics = createAnalyticsClient((name, properties) =>
    captured.push({ name, properties }),
  );

  analytics.capture("submission_failed", {
    tenant: configuredTenant,
    role: "administrator",
    form: "application",
    dashboard: "executive",
    reason: "server-error",
  });
  analytics.capture("submission_failed", {
    tenant: configuredTenant,
    form: "submission",
    reason: "mutation_failed",
  });

  assert.deepEqual(captured, [
    {
      name: "submission_failed",
      properties: { tenant: configuredTenant },
    },
    {
      name: "submission_failed",
      properties: {
        tenant: configuredTenant,
        form: "submission",
        reason: "mutation_failed",
      },
    },
  ]);
});

test("queues valid captures until PostHog is ready and then delivers them", () => {
  const captured: unknown[] = [];
  const analytics = createQueuedAnalyticsClient();

  analytics.capture("dashboard_viewed", {
    tenant: configuredTenant,
    role: "superadmin",
    dashboard: "admin_analytics",
  });
  analytics.capture("dashboard_viewed", {
    tenant: configuredTenant,
    role: "superadmin",
    dashboard: "not_a_dashboard",
  });

  analytics.setCapture((name, properties) => captured.push({ name, properties }));

  assert.deepEqual(captured, [
    {
      name: "dashboard_viewed",
      properties: {
        tenant: configuredTenant,
        role: "superadmin",
        dashboard: "admin_analytics",
      },
    },
  ]);
});

test("allows only the finite analytics dashboard identifiers", () => {
  const captured: unknown[] = [];
  const analytics = createAnalyticsClient((name, properties) =>
    captured.push({ name, properties }),
  );

  for (const [role, dashboard] of [
    ["superadmin", "admin_analytics"],
    ["sponsor", "sponsor_analytics"],
    ["judge", "judge_analytics"],
  ] as const) {
    analytics.capture("dashboard_viewed", { tenant: configuredTenant, role, dashboard });
  }
  analytics.capture("dashboard_viewed", {
    tenant: configuredTenant,
    role: "superadmin",
    dashboard: "admin",
  });

  assert.equal(captured.length, 3);
});

test("derives allowed analytics tenants from the configured tenant registry", () => {
  assert.deepEqual(
    [...allowedTenantIdentifiers].sort(),
    Object.keys(tenantConfigByIdentifier).sort(),
  );
});

test("disables PostHog automatic capture paths", () => {
  assert.deepEqual(posthogOptions, {
    api_host: "/ingest",
    ui_host: "https://us.posthog.com",
    defaults: "2025-05-24",
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
  });
});
