import type { VettingEventConfig } from "./types";

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
