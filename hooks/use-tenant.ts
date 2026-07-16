"use client";

import { tenantConfigByIdentifier } from "@/tenants/registry";
import { useParams } from "next/navigation";
import ParticiantHeader from "@/tenants/designverse/descriptions/participants.mdx";
import JudgeHeader from "@/tenants/designverse/descriptions/judges.mdx";
import SpeakerHeader from "@/tenants/designverse/descriptions/speakers.mdx";
import SuperadminHeader from "@/tenants/designverse/descriptions/superadmins.mdx";
import VolunteerHeader from "@/tenants/designverse/descriptions/volunteers.mdx";
import FeedbackHeader from "@/tenants/designverse/descriptions/feedback.mdx";
import SubmissionHeader from "@/tenants/designverse/descriptions/submission.mdx";

type tenants = keyof typeof tenantConfigByIdentifier;

export const useTenant = () => {
  const { tenant } = useParams<{ tenant: tenants }>();
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
  };

  const config = tenantConfigByIdentifier[slug];

  return {
    headers: headers[slug],
    tenant: config,
    name: slug,
    live: config?.event ?? null,
  } as const;
};
