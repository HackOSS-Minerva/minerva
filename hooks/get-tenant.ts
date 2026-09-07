import designverse from "@/tenants/designverse/designverse.json";
import cutiehack from "@/tenants/cutiehack/cutiehack.json";
import DesignverseParticipantHeader from "@/tenants/designverse/descriptions/participants.mdx";
import DesignverseJudgeHeader from "@/tenants/designverse/descriptions/judges.mdx";
import DesignverseSpeakerHeader from "@/tenants/designverse/descriptions/speakers.mdx";
import DesignverseSuperadminHeader from "@/tenants/designverse/descriptions/superadmins.mdx";
import DesignverseVolunteerHeader from "@/tenants/designverse/descriptions/volunteers.mdx";
import DesignverseFeedbackHeader from "@/tenants/designverse/descriptions/feedback.mdx";
import DesignverseSubmissionHeader from "@/tenants/designverse/descriptions/submission.mdx";
import DesignverseRules from "@/tenants/designverse/descriptions/rules.mdx";
import DesignverseVenue from "@/tenants/designverse/descriptions/venue.mdx";
import DesignverseCodeOfConduct from "@/tenants/designverse/descriptions/code-of-conduct.mdx";
import DesignverseJudgeOrientation from "@/tenants/designverse/descriptions/judge-orientation.mdx";
import CutiehackParticipantHeader from "@/tenants/cutiehack/descriptions/participants.mdx";
import CutiehackJudgeHeader from "@/tenants/cutiehack/descriptions/judges.mdx";
import CutiehackSpeakerHeader from "@/tenants/cutiehack/descriptions/speakers.mdx";
import CutiehackSuperadminHeader from "@/tenants/cutiehack/descriptions/superadmins.mdx";
import CutiehackVolunteerHeader from "@/tenants/cutiehack/descriptions/volunteers.mdx";
import CutiehackFeedbackHeader from "@/tenants/cutiehack/descriptions/feedback.mdx";
import CutiehackSubmissionHeader from "@/tenants/cutiehack/descriptions/submission.mdx";
import CutiehackRules from "@/tenants/cutiehack/descriptions/rules.mdx";
import CutiehackVenue from "@/tenants/cutiehack/descriptions/venue.mdx";
import CutiehackCodeOfConduct from "@/tenants/cutiehack/descriptions/code-of-conduct.mdx";
import CutiehackJudgeOrientation from "@/tenants/cutiehack/descriptions/judge-orientation.mdx";

export const tenantSlugs = ["designverse", "cutiehack"] as const;
export type TenantSlug = (typeof tenantSlugs)[number];

export interface TenantConfig {
  slug: TenantSlug;
  name: string;
  domain: string;
  discord: string;
  email: string;
  instagram: string;
  linkedin: string;
  devpost?: string;
  heart: string;
  logo: string;
  calendarid: string;
  event: {
    name: string;
    startTime: string;
    endTime: string;
    deadline: string;
    status?: string;
    openOffset?: string;
  };
  locks?: Record<
    string,
    string[] | boolean | Record<string, string[] | boolean>
  >;
  formLocks?: Record<string, { opens: string; closes: string }>;
}

const tenantConfigs: Record<TenantSlug, TenantConfig> = {
  designverse: {
    ...designverse,
    slug: "designverse",
  },
  cutiehack: {
    ...cutiehack,
    slug: "cutiehack",
  },
};

const tenantContent = {
  designverse: {
    headers: {
      participant: DesignverseParticipantHeader,
      judge: DesignverseJudgeHeader,
      speaker: DesignverseSpeakerHeader,
      superadmin: DesignverseSuperadminHeader,
      volunteer: DesignverseVolunteerHeader,
      feedback: DesignverseFeedbackHeader,
      submission: DesignverseSubmissionHeader,
    },
    markdown: {
      rules: DesignverseRules,
      codeOfConduct: DesignverseCodeOfConduct,
      venue: DesignverseVenue,
      orientation: DesignverseJudgeOrientation,
    },
  },
  cutiehack: {
    headers: {
      participant: CutiehackParticipantHeader,
      judge: CutiehackJudgeHeader,
      speaker: CutiehackSpeakerHeader,
      superadmin: CutiehackSuperadminHeader,
      volunteer: CutiehackVolunteerHeader,
      feedback: CutiehackFeedbackHeader,
      submission: CutiehackSubmissionHeader,
    },
    markdown: {
      rules: CutiehackRules,
      codeOfConduct: CutiehackCodeOfConduct,
      venue: CutiehackVenue,
      orientation: CutiehackJudgeOrientation,
    },
  },
} satisfies Record<TenantSlug, object>;

type TenantContent = (typeof tenantContent)[TenantSlug];

const isTenantSlug = (slug: string): slug is TenantSlug =>
  tenantSlugs.includes(slug as TenantSlug);

export function getTenant(slug: TenantSlug): {
  config: TenantConfig;
  headers: TenantContent["headers"];
  markdown: TenantContent["markdown"];
};
export function getTenant(slug: string): {
  config: TenantConfig | undefined;
  headers: TenantContent["headers"] | undefined;
  markdown: TenantContent["markdown"] | undefined;
};
export function getTenant(slug: string): {
  config: TenantConfig | undefined;
  headers: TenantContent["headers"] | undefined;
  markdown: TenantContent["markdown"] | undefined;
} {
  if (!isTenantSlug(slug)) {
    return {
      config: undefined,
      headers: undefined,
      markdown: undefined,
    };
  }

  const config = tenantConfigs[slug];
  const content = tenantContent[slug];

  return {
    config,
    headers: content?.headers,
    markdown: content?.markdown,
  } as const;
}
