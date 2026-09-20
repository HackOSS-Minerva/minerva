import tenant_cutiehack_config from "@/tenants/cutiehack/cutiehack.json";
import tenant_cutiehack_participants from "@/tenants/cutiehack/descriptions/participants.mdx";
import tenant_cutiehack_judges from "@/tenants/cutiehack/descriptions/judges.mdx";
import tenant_cutiehack_speakers from "@/tenants/cutiehack/descriptions/speakers.mdx";
import tenant_cutiehack_superadmins from "@/tenants/cutiehack/descriptions/superadmins.mdx";
import tenant_cutiehack_volunteers from "@/tenants/cutiehack/descriptions/volunteers.mdx";
import tenant_cutiehack_feedback from "@/tenants/cutiehack/descriptions/feedback.mdx";
import tenant_cutiehack_submission from "@/tenants/cutiehack/descriptions/submission.mdx";
import tenant_cutiehack_rules from "@/tenants/cutiehack/descriptions/rules.mdx";
import tenant_cutiehack_code_of_conduct from "@/tenants/cutiehack/descriptions/code-of-conduct.mdx";
import tenant_cutiehack_venue from "@/tenants/cutiehack/descriptions/venue.mdx";
import tenant_cutiehack_judge_orientation from "@/tenants/cutiehack/descriptions/judge-orientation.mdx";
import tenant_designverse_config from "@/tenants/designverse/designverse.json";
import tenant_designverse_participants from "@/tenants/designverse/descriptions/participants.mdx";
import tenant_designverse_judges from "@/tenants/designverse/descriptions/judges.mdx";
import tenant_designverse_speakers from "@/tenants/designverse/descriptions/speakers.mdx";
import tenant_designverse_superadmins from "@/tenants/designverse/descriptions/superadmins.mdx";
import tenant_designverse_volunteers from "@/tenants/designverse/descriptions/volunteers.mdx";
import tenant_designverse_feedback from "@/tenants/designverse/descriptions/feedback.mdx";
import tenant_designverse_submission from "@/tenants/designverse/descriptions/submission.mdx";
import tenant_designverse_rules from "@/tenants/designverse/descriptions/rules.mdx";
import tenant_designverse_code_of_conduct from "@/tenants/designverse/descriptions/code-of-conduct.mdx";
import tenant_designverse_venue from "@/tenants/designverse/descriptions/venue.mdx";
import tenant_designverse_judge_orientation from "@/tenants/designverse/descriptions/judge-orientation.mdx";

export const tenantSlugs = ["cutiehack", "designverse"] as const;

export const tenantConfigs = {
  cutiehack: tenant_cutiehack_config,
  designverse: tenant_designverse_config,
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
      codeOfConduct: tenant_cutiehack_code_of_conduct,
      venue: tenant_cutiehack_venue,
      orientation: tenant_cutiehack_judge_orientation,
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
      codeOfConduct: tenant_designverse_code_of_conduct,
      venue: tenant_designverse_venue,
      orientation: tenant_designverse_judge_orientation,
    },
  },
} as const;
