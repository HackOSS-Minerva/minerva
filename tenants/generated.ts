import tenant_cutiehack_config from "@/tenants/cutiehack/cutiehack.json";
import tenant_cutiehack_participants from "@/tenants/cutiehack/descriptions/participants.mdx";
import tenant_cutiehack_judges from "@/tenants/cutiehack/descriptions/judges.mdx";
import tenant_cutiehack_speakers from "@/tenants/cutiehack/descriptions/speakers.mdx";
import tenant_cutiehack_superadmins from "@/tenants/cutiehack/descriptions/superadmins.mdx";
import tenant_cutiehack_volunteers from "@/tenants/cutiehack/descriptions/volunteers.mdx";
import tenant_cutiehack_feedback from "@/tenants/cutiehack/descriptions/feedback.mdx";
import tenant_cutiehack_submission from "@/tenants/cutiehack/descriptions/submission.mdx";
import tenant_cutiehack_rules from "@/tenants/cutiehack/descriptions/rules.mdx";
import tenant_cutiehack_venue from "@/tenants/cutiehack/descriptions/venue.mdx";
import tenant_cutiehack_code_of_conduct from "@/tenants/cutiehack/descriptions/code-of-conduct.mdx";
import tenant_designverse_config from "@/tenants/designverse/designverse.json";
import tenant_designverse_participants from "@/tenants/designverse/descriptions/participants.mdx";
import tenant_designverse_judges from "@/tenants/designverse/descriptions/judges.mdx";
import tenant_designverse_speakers from "@/tenants/designverse/descriptions/speakers.mdx";
import tenant_designverse_superadmins from "@/tenants/designverse/descriptions/superadmins.mdx";
import tenant_designverse_volunteers from "@/tenants/designverse/descriptions/volunteers.mdx";
import tenant_designverse_feedback from "@/tenants/designverse/descriptions/feedback.mdx";
import tenant_designverse_submission from "@/tenants/designverse/descriptions/submission.mdx";
import tenant_designverse_rules from "@/tenants/designverse/descriptions/rules.mdx";
import tenant_designverse_venue from "@/tenants/designverse/descriptions/venue.mdx";
import tenant_designverse_code_of_conduct from "@/tenants/designverse/descriptions/code-of-conduct.mdx";
import tenant_tenant_sync_e2e_config from "@/tenants/tenant-sync-e2e/tenant-sync-e2e.json";
import tenant_tenant_sync_e2e_participants from "@/tenants/tenant-sync-e2e/descriptions/participants.mdx";
import tenant_tenant_sync_e2e_judges from "@/tenants/tenant-sync-e2e/descriptions/judges.mdx";
import tenant_tenant_sync_e2e_speakers from "@/tenants/tenant-sync-e2e/descriptions/speakers.mdx";
import tenant_tenant_sync_e2e_superadmins from "@/tenants/tenant-sync-e2e/descriptions/superadmins.mdx";
import tenant_tenant_sync_e2e_volunteers from "@/tenants/tenant-sync-e2e/descriptions/volunteers.mdx";
import tenant_tenant_sync_e2e_feedback from "@/tenants/tenant-sync-e2e/descriptions/feedback.mdx";
import tenant_tenant_sync_e2e_submission from "@/tenants/tenant-sync-e2e/descriptions/submission.mdx";
import tenant_tenant_sync_e2e_rules from "@/tenants/tenant-sync-e2e/descriptions/rules.mdx";
import tenant_tenant_sync_e2e_venue from "@/tenants/tenant-sync-e2e/descriptions/venue.mdx";
import tenant_tenant_sync_e2e_code_of_conduct from "@/tenants/tenant-sync-e2e/descriptions/code-of-conduct.mdx";

export const tenantSlugs = [
  "cutiehack",
  "designverse",
  "tenant-sync-e2e",
] as const;

export const tenantConfigs = {
  cutiehack: tenant_cutiehack_config,
  designverse: tenant_designverse_config,
  "tenant-sync-e2e": tenant_tenant_sync_e2e_config,
};

export const tenantContent = {
  cutiehack: {
    headers: {
      participant: tenant_cutiehack_participants,
      judge: tenant_cutiehack_judges,
      speaker: tenant_cutiehack_speakers,
      superadmin: tenant_cutiehack_superadmins,
      volunteer: tenant_cutiehack_volunteers,
      feedback: tenant_cutiehack_feedback,
      submission: tenant_cutiehack_submission,
    },
    markdown: {
      rules: tenant_cutiehack_rules,
      venue: tenant_cutiehack_venue,
      codeOfConduct: tenant_cutiehack_code_of_conduct,
    },
  },
  designverse: {
    headers: {
      participant: tenant_designverse_participants,
      judge: tenant_designverse_judges,
      speaker: tenant_designverse_speakers,
      superadmin: tenant_designverse_superadmins,
      volunteer: tenant_designverse_volunteers,
      feedback: tenant_designverse_feedback,
      submission: tenant_designverse_submission,
    },
    markdown: {
      rules: tenant_designverse_rules,
      venue: tenant_designverse_venue,
      codeOfConduct: tenant_designverse_code_of_conduct,
    },
  },
  "tenant-sync-e2e": {
    headers: {
      participant: tenant_tenant_sync_e2e_participants,
      judge: tenant_tenant_sync_e2e_judges,
      speaker: tenant_tenant_sync_e2e_speakers,
      superadmin: tenant_tenant_sync_e2e_superadmins,
      volunteer: tenant_tenant_sync_e2e_volunteers,
      feedback: tenant_tenant_sync_e2e_feedback,
      submission: tenant_tenant_sync_e2e_submission,
    },
    markdown: {
      rules: tenant_tenant_sync_e2e_rules,
      venue: tenant_tenant_sync_e2e_venue,
      codeOfConduct: tenant_tenant_sync_e2e_code_of_conduct,
    },
  },
} as const;
