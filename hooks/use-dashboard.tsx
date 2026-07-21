"use client";

import { useParams } from "next/navigation";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useTenant } from "./use-tenant";
import type { FunctionReference } from "convex/server";
import * as participants from "@/components/dashboards/dashboards/participants";
import * as judges from "@/components/dashboards/dashboards/judges";
import * as speakers from "@/components/dashboards/dashboards/speakers";
import * as superadmins from "@/components/dashboards/dashboards/superadmins";
import * as volunteers from "@/components/dashboards/dashboards/volunteers";
import * as attendance from "@/components/dashboards/dashboards/attendance";
import * as feedback from "@/components/dashboards/dashboards/feedback";
import * as submissions from "@/components/dashboards/dashboards/submissions";

type slugs =
  | "participants"
  | "judges"
  | "speakers"
  | "superadmins"
  | "volunteers"
  | "attendance"
  | "feedback"
  | "submissions";

type DashboardQueryArgs = { tenant: string; eventid?: string };

type DashboardQuery = FunctionReference<
  "query",
  "public",
  DashboardQueryArgs,
  unknown
>;

const DASHBOARDS = {
  participants,
  judges,
  speakers,
  superadmins,
  volunteers,
  attendance,
  feedback,
  submissions,
} as const;

const QUERIES: Record<slugs, DashboardQuery> = {
  participants: api.participants.get,
  judges: api.judges.get,
  speakers: api.speakers.get,
  superadmins: api.superadmins.get,
  volunteers: api.volunteers.get,
  attendance: api.checkins.getByEvent,
  feedback: api.feedback.get,
  submissions: api.submissions.get,
};

export const useDashboard = (eventid?: string) => {
  const { dashboard } = useParams<{ dashboard: slugs }>();
  const { tenant } = useTenant();
  const slug = dashboard;
  const tenantName = tenant.name.toLocaleLowerCase();

  const data = useQuery(QUERIES[slug], {
    tenant: tenantName,
    ...(slug === "attendance" && eventid ? { eventid } : {}),
  });

  const allDeleteMutations = {
    participants: useMutation(api.participants.remove),
    judges: useMutation(api.judges.remove),
    speakers: useMutation(api.speakers.remove),
    superadmins: useMutation(api.superadmins.remove),
    volunteers: useMutation(api.volunteers.remove),
    attendance: useMutation(api.checkins.remove),
    feedback: useMutation(api.feedback.remove),
    submissions: useMutation(api.submissions.remove),
  } as const;

  const allDeleteManyMutations = {
    participants: useMutation(api.participants.deleteMany),
    judges: useMutation(api.judges.deleteMany),
    speakers: useMutation(api.speakers.deleteMany),
    superadmins: useMutation(api.superadmins.deleteMany),
    volunteers: useMutation(api.volunteers.deleteMany),
    attendance: useMutation(api.checkins.deleteMany),
    feedback: useMutation(api.feedback.deleteMany),
    submissions: useMutation(api.submissions.deleteMany),
  } as const;

  const allSetStatusManyMutations = {
    participants: useMutation(api.participants.setStatusMany),
    judges: useMutation(api.judges.setStatusMany),
    speakers: useMutation(api.speakers.setStatusMany),
    superadmins: useMutation(api.superadmins.setStatusMany),
    volunteers: useMutation(api.volunteers.setStatusMany),
  } as const;

  const onDelete = allDeleteMutations[slug as keyof typeof allDeleteMutations];
  const onDeleteMany = allDeleteManyMutations[slug as keyof typeof allDeleteManyMutations];
  const setStatusMany = allSetStatusManyMutations[slug as keyof typeof allSetStatusManyMutations];

  return {
    dashboard: DASHBOARDS[slug],
    data: (data ?? []) as any,
    onDelete,
    onDeleteMany,
    setStatusMany,
  } as const;
};
