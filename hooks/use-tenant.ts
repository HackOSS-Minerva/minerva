"use client";

import designverse from "@/tenants/designverse/designverse.json";
import { useParams } from "next/navigation";
import ParticiantHeader from "@/tenants/designverse/descriptions/participants.mdx";
import JudgeHeader from "@/tenants/designverse/descriptions/judges.mdx";
import SpeakerHeader from "@/tenants/designverse/descriptions/speakers.mdx";
import SuperadminHeader from "@/tenants/designverse/descriptions/superadmins.mdx";
import VolunteerHeader from "@/tenants/designverse/descriptions/volunteers.mdx";
import FeedbackHeader from "@/tenants/designverse/descriptions/feedback.mdx";
import SubmissionHeader from "@/tenants/designverse/descriptions/submission.mdx";

type tenants = "designverse";

export interface LiveInfo {
  name: string;
  status: string;
  startTime: string;
  endTime: string;
  openOffset?: string;
  submission: {
    url: string;
    deadline: string;
    requirements: string;
  };
}

export interface FormLock {
  opens: string;
  closes: string;
}

export interface TenantConfig {
  name: string;
  domain: string;
  discord: string;
  email: string;
  instagram: string;
  linkedin: string;
  heart: string;
  logo: string;
  calendarid: string;
  event?: LiveInfo;
  formLocks?: Record<string, FormLock>;
}

export const useTenant = () => {
  const { tenant } = useParams<{ tenant: tenants }>();
  const slug = tenant;

  const tenants: Record<string, TenantConfig> = {
    designverse: designverse as TenantConfig,
  };

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

  const config = tenants[slug];

  return {
    headers: headers[slug],
    tenant: config,
    name: slug,
    live: config?.event ?? null,
  } as const;
};
