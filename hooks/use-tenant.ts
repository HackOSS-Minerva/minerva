"use client";

import { useParams } from "next/navigation";
import ParticiantHeader from "@/tenants/designverse/descriptions/participants.mdx";
import JudgeHeader from "@/tenants/designverse/descriptions/judges.mdx";
import SpeakerHeader from "@/tenants/designverse/descriptions/speakers.mdx";
import SuperadminHeader from "@/tenants/designverse/descriptions/superadmins.mdx";
import VolunteerHeader from "@/tenants/designverse/descriptions/volunteers.mdx";
import FeedbackHeader from "@/tenants/designverse/descriptions/feedback.mdx";
import SubmissionHeader from "@/tenants/designverse/descriptions/submission.mdx";
import { getTenantConfig, type TenantSlug } from "@/lib/tenant-config";
import CutiehackParticiantHeader from "@/tenants/cutiehack/descriptions/participants.mdx";
import CutiehackJudgeHeader from "@/tenants/cutiehack/descriptions/judges.mdx";
import CutiehackSpeakerHeader from "@/tenants/cutiehack/descriptions/speakers.mdx";
import CutiehackSuperadminHeader from "@/tenants/cutiehack/descriptions/superadmins.mdx";
import CutiehackVolunteerHeader from "@/tenants/cutiehack/descriptions/volunteers.mdx";
import CutiehackFeedbackHeader from "@/tenants/cutiehack/descriptions/feedback.mdx";
import CutiehackSubmissionHeader from "@/tenants/cutiehack/descriptions/submission.mdx";
import RulesMarkdown from "@/tenants/designverse/descriptions/rules.mdx";
import VenueMarkdown from "@/tenants/designverse/descriptions/venue.mdx";
import CodeOfConductMarkdown from "@/tenants/designverse/descriptions/code-of-conduct.mdx";
import JudgeOrientationMarkdown from "@/tenants/designverse/descriptions/judge-orientation.mdx";
import CutiehackRulesMarkdown from "@/tenants/cutiehack/descriptions/rules.mdx";
import CutiehackVenueMarkdown from "@/tenants/cutiehack/descriptions/venue.mdx";
import CutiehackCodeOfConductMarkdown from "@/tenants/cutiehack/descriptions/code-of-conduct.mdx";
import CutiehackJudgeOrientationMarkdown from "@/tenants/cutiehack/descriptions/judge-orientation.mdx";

export const useTenant = () => {
  const { tenant } = useParams<{ tenant: TenantSlug }>();
  const slug = tenant;

  const headers = {
    designverse: {
      participant: ParticiantHeader,
      judge: JudgeHeader,
      speaker: SpeakerHeader,
      superadmin: SuperadminHeader,
      volunteer: VolunteerHeader,
      feedback: FeedbackHeader,
      submission: SubmissionHeader,
    },
    cutiehack: {
      participant: CutiehackParticiantHeader,
      judge: CutiehackJudgeHeader,
      speaker: CutiehackSpeakerHeader,
      superadmin: CutiehackSuperadminHeader,
      volunteer: CutiehackVolunteerHeader,
      feedback: CutiehackFeedbackHeader,
      submission: CutiehackSubmissionHeader,
    },
  };

  const markdown = {
    designverse: {
      rules: RulesMarkdown,
      codeOfConduct: CodeOfConductMarkdown,
      venue: VenueMarkdown,
      orientation: JudgeOrientationMarkdown,
    },
    cutiehack: {
      rules: CutiehackRulesMarkdown,
      codeOfConduct: CutiehackCodeOfConductMarkdown,
      venue: CutiehackVenueMarkdown,
      orientation: CutiehackJudgeOrientationMarkdown,
    },
  };

  const config = getTenantConfig(slug);

  return {
    headers: headers[slug],
    tenant: config,
    name: slug,
    live: config?.event ?? null,
    markdown: markdown[slug],
  } as const;
};
