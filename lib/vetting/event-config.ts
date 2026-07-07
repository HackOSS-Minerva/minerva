import type { VettingEventConfig } from "./types";

const TENANT_EVENT_CONFIGS: Record<
  string,
  {
    eventName: string;
    startsAt: string;
    submissionDeadlineAt: string;
  }
> = {
  designverse: {
    eventName: "DesignVerse 2026",
    startsAt: "2026-10-28T00:00:00.000Z",
    submissionDeadlineAt: "2026-10-31T23:59:59.000Z",
  },
};

export function getDefaultVettingConfig(input: {
  tenant: string;
  eventName: string;
  startsAt: string;
  submissionDeadlineAt: string;
}): VettingEventConfig {
  return {
    tenant: input.tenant,
    name: input.eventName,
    startsAt: new Date(input.startsAt).getTime(),
    submissionDeadlineAt: new Date(input.submissionDeadlineAt).getTime(),
    teamSizeLimit: 4,
    gitCommitGraceWindowMinutes: 15,
    githubVettingEnabled: true,
  };
}

export function getRuntimeVettingConfigForTenant(
  tenant: string,
): VettingEventConfig {
  const normalizedTenant = tenant.trim().toLowerCase();
  const config = TENANT_EVENT_CONFIGS[normalizedTenant];

  if (!config) {
    const now = Date.now();
    return {
      tenant: normalizedTenant,
      name: normalizedTenant,
      startsAt: now,
      submissionDeadlineAt: now,
      teamSizeLimit: 4,
      gitCommitGraceWindowMinutes: 15,
      githubVettingEnabled: true,
    };
  }

  return getDefaultVettingConfig({
    tenant: normalizedTenant,
    eventName: config.eventName,
    startsAt: config.startsAt,
    submissionDeadlineAt: config.submissionDeadlineAt,
  });
}
