"use client";

import { useParams } from "next/navigation";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import type { Doc } from "@/convex/_generated/dataModel";
import { getTenant, type TenantSlug } from "./get-tenant";
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
import type { VettingBatchResult } from "@/lib/vetting/types";
import { useSubmissionVetting } from "./use-submissions";

type slugs =
  | "participants"
  | "judges"
  | "speakers"
  | "superadmins"
  | "volunteers"
  | "attendance"
  | "feedback"
  | "submissions";

/** Dashboard column/csv modules, keyed by route slug. */
type DashboardModules = {
  participants: typeof participants;
  judges: typeof judges;
  speakers: typeof speakers;
  superadmins: typeof superadmins;
  volunteers: typeof volunteers;
  attendance: typeof attendance;
  feedback: typeof feedback;
  submissions: typeof submissions;
};

/** Row shape returned by each dashboard's Convex query, keyed by route slug. */
type DashboardRowMap = {
  participants: Doc<"participants">;
  judges: Doc<"judges">;
  speakers: Doc<"speakers">;
  superadmins: Doc<"superadmins">;
  volunteers: Doc<"volunteers">;
  attendance: Doc<"checkins">;
  feedback: Doc<"feedback">;
  submissions: Doc<"submissions">;
};

/**
 * Correlated view of everything a dashboard table needs: the discriminant
 * (`slug`) ties the row data, the column module, and the callbacks together so
 * consumers can narrow with a single `switch`.
 */
export type DashboardBundle = {
  [S in slugs]: {
    slug: S;
    dashboard: DashboardModules[S];
    data: DashboardRowMap[S][];
    onDelete(args: { id: string }): Promise<unknown>;
    onDeleteMany(args: { ids: string[] }): Promise<unknown>;
    setStatusMany?(args: {
      ids: string[];
      status: ApplicationStatus;
    }): Promise<unknown>;
    runVettingMany?: (ids: string[]) => Promise<VettingBatchResult[]>;
  };
}[slugs];

const DASHBOARDS: DashboardModules = {
  participants,
  judges,
  speakers,
  superadmins,
  volunteers,
  attendance,
  feedback,
  submissions,
};

/**
 * Convex mutations take branded `Id<Table>` arguments (compile-time only; the
 * brand is a plain string at runtime), while dashboard callbacks receive row
 * ids as plain strings from table selection. This helper is the single
 * conversion point between the two.
 */
const adaptMutationArgs = <TArgs extends object>(
  mutation: (args: never) => unknown,
): ((args: TArgs) => Promise<unknown>) =>
  mutation as unknown as (args: TArgs) => Promise<unknown>;

const applicationRoleByDashboard = {
  participants: "participant",
  judges: "judge",
  speakers: "speaker",
  superadmins: "superadmin",
  volunteers: "volunteer",
} as const satisfies Partial<Record<slugs, AnalyticsRole>>;

const QUERIES = {
  participants: api.participants.get,
  judges: api.judges.get,
  speakers: api.speakers.get,
  superadmins: api.superadmins.get,
  volunteers: api.volunteers.get,
  attendance: api.checkins.getByEvent,
  feedback: api.feedback.get,
  submissions: api.submissions.get,
} as const;

export const useDashboard = (eventid?: string) => {
  const { dashboard, tenant } = useParams<{
    dashboard: slugs;
    tenant: TenantSlug;
  }>();
  const { config } = getTenant(tenant);
  const { runVettingMany } = useSubmissionVetting();
  const slug = dashboard;
  const tenantName = config.slug.toLocaleLowerCase();

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

  const onDeleteWithAnalytics = async ({ id }: { id: string }) => {
    const callDelete = adaptMutationArgs<{ id: string }>(onDelete);
    const result = await callDelete({ id });
    captureDeletion(id);
    return result;
  };

  const onDeleteManyWithAnalytics = async ({ ids }: { ids: string[] }) => {
    const callDeleteMany = adaptMutationArgs<{ ids: string[] }>(onDeleteMany);
    const result = await callDeleteMany({ ids });
    ids.forEach(captureDeletion);
    return result;
  };

  const setStatusManyWithAnalytics = async ({
    ids,
    status,
  }: {
    ids: string[];
    status: ApplicationStatus;
  }) => {
    const callSetStatusMany = adaptMutationArgs<{
      ids: string[];
      status: ApplicationStatus;
    }>(setStatusMany);
    const result = await callSetStatusMany({ ids, status });

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

  // Single correlation cast: the runtime `slug` determines which member of
  // `DashboardBundle` this object is (row data, column module, and callbacks
  // all line up for that slug) — a relationship TypeScript cannot verify
  // across separately-computed dynamic key lookups.
  return {
    slug,
    dashboard: DASHBOARDS[slug],
    data: data ?? [],
    onDelete: shouldCaptureDeletion ? onDeleteWithAnalytics : onDelete,
    onDeleteMany: shouldCaptureDeletion
      ? onDeleteManyWithAnalytics
      : onDeleteMany,
    setStatusMany: role ? setStatusManyWithAnalytics : setStatusMany,
    runVettingMany: slug === "submissions" ? runVettingMany : undefined,
  } as DashboardBundle;
};
