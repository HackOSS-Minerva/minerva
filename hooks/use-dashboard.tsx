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
import {
  captureAnalyticsEvent,
  type AnalyticsRole,
  type ApplicationStatus,
} from "@/lib/posthog";

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

const applicationRoleByDashboard = {
  participants: "participant",
  judges: "judge",
  speakers: "speaker",
  superadmins: "superadmin",
  volunteers: "volunteer",
} as const satisfies Partial<Record<slugs, AnalyticsRole>>;

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
  const onDeleteMany =
    allDeleteManyMutations[slug as keyof typeof allDeleteManyMutations];
  const setStatusMany =
    allSetStatusManyMutations[slug as keyof typeof allSetStatusManyMutations];

  const role =
    applicationRoleByDashboard[slug as keyof typeof applicationRoleByDashboard];
  const shouldCaptureDeletion =
    Boolean(role) || slug === "attendance" || slug === "submissions";

  const captureDeletion = (id: string) => {
    if (role) {
      captureAnalyticsEvent("application_deleted", {
        tenant: tenantName,
        entity_id: id,
        role,
      });
    } else if (slug === "attendance") {
      captureAnalyticsEvent("checkin_deleted", {
        tenant: tenantName,
        entity_id: id,
      });
    } else if (slug === "submissions") {
      captureAnalyticsEvent("submission_deleted", {
        tenant: tenantName,
        entity_id: id,
      });
    }
  };

  const onDeleteWithAnalytics = async (id: string) => {
    const mutation = onDelete as unknown as (args: {
      id: string;
    }) => Promise<unknown>;
    const result = await mutation({ id });
    captureDeletion(id);
    return result;
  };

  const onDeleteManyWithAnalytics = async ({ ids }: { ids: string[] }) => {
    const mutation = onDeleteMany as unknown as (args: {
      ids: string[];
    }) => Promise<unknown>;
    const result = await mutation({ ids });
    ids.forEach(captureDeletion);
    return result;
  };

  const setStatusManyWithAnalytics = async (
    ids: string[],
    status: ApplicationStatus,
  ) => {
    const mutation = setStatusMany as unknown as (args: {
      ids: string[];
      status: ApplicationStatus;
    }) => Promise<unknown>;
    const result = await mutation({ ids, status });

    if (role) {
      for (const id of ids) {
        captureAnalyticsEvent("application_status_changed", {
          tenant: tenantName,
          entity_id: id,
          role,
          status,
        });
      }
    }

    return result;
  };

  return {
    dashboard: DASHBOARDS[slug],
    data: (data ?? []) as unknown[],
    onDelete: shouldCaptureDeletion ? onDeleteWithAnalytics : onDelete,
    onDeleteMany: shouldCaptureDeletion
      ? onDeleteManyWithAnalytics
      : onDeleteMany,
    setStatusMany: role ? setStatusManyWithAnalytics : setStatusMany,
  } as const;
};
