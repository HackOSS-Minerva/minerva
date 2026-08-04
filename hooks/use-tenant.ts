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
  };

  const config = getTenantConfig(slug);

  return {
    headers: headers[slug],
    tenant: config,
    name: slug,
    live: config?.event ?? null,
  } as const;
};
