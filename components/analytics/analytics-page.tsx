"use client";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useAnalytics } from "@/hooks/use-analytics";
import type {
  AnalyticsRole,
  ParticipantDemographicBreakdown,
  ParticipantDemographicKey,
} from "@/lib/posthog";

type AnalyticsPageProps = {
  tenant: string;
  audience: "admin" | "sponsor";
};

type MetricCardProps = {
  label: string;
  value: number;
  description?: string;
};

const roleLabels: Record<AnalyticsRole, string> = {
  participant: "Participants",
  judge: "Judges",
  speaker: "Speakers",
  superadmin: "Superadmins",
  volunteer: "Volunteers",
};

const roles = Object.keys(roleLabels) as AnalyticsRole[];

const participantDemographicLabels: Record<ParticipantDemographicKey, string> =
  {
    gender: "Gender",
    dietrestriction: "Dietary restrictions",
    shirt: "Shirt size",
    school: "School",
    major: "Major",
    age: "Age",
    grade: "Grade",
  };

const participantDemographicKeys: ParticipantDemographicKey[] = [
  "gender",
  "age",
  "dietrestriction",
  "shirt",
  "school",
  "major",
  "grade",
];

function MetricCard({ label, value, description }: MetricCardProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm font-medium">{label}</CardTitle>
        {description ? <CardDescription>{description}</CardDescription> : null}
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold tabular-nums">
          {value.toLocaleString()}
        </div>
      </CardContent>
    </Card>
  );
}

type ParticipantDemographicCardProps = {
  label: string;
  breakdown: ParticipantDemographicBreakdown[];
};

function ParticipantDemographicCard({
  label,
  breakdown,
}: ParticipantDemographicCardProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">{label}</CardTitle>
      </CardHeader>
      <CardContent>
        {breakdown.length > 0 ? (
          <div className="space-y-4">
            {breakdown.map((item) => {
              const barWidth = Math.min(Math.max(item.percentage, 0), 100);

              return (
                <div key={item.value} className="space-y-2">
                  <div className="flex items-start justify-between gap-4 text-sm">
                    <span className="break-words">{item.value}</span>
                    <span className="shrink-0 tabular-nums">
                      {item.count.toLocaleString()} (
                      {item.percentage.toLocaleString()}%)
                    </span>
                  </div>
                  <div className="bg-muted h-2 overflow-hidden rounded-full">
                    <div
                      className="bg-primary h-full rounded-full"
                      style={{ width: `${barWidth}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <span className="text-muted-foreground text-sm">
            No PostHog data yet
          </span>
        )}
      </CardContent>
    </Card>
  );
}

export function AnalyticsPage({ tenant, audience }: AnalyticsPageProps) {
  const { data, isLoading, isError, refetch, isFetching } =
    useAnalytics(tenant);

  if (isLoading) return null;

  if (isError || !data) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Analytics unavailable</CardTitle>
          <CardDescription>
            PostHog metrics could not be loaded for this event.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button onClick={() => refetch()} disabled={isFetching}>
            {isFetching ? "Retrying..." : "Retry"}
          </Button>
        </CardContent>
      </Card>
    );
  }

  const sponsorMetrics: MetricCardProps[] = [
    {
      label: "Total applications",
      value: data.applications.total,
      description: "Across all application roles",
    },
    {
      label: "Accepted participants",
      value: data.applications.byRole.participant.accepted,
      description: "Current accepted participant applications",
    },
    {
      label: "Active participants",
      value: data.checkins.activeParticipants,
      description: "Unique participants with a successful check-in",
    },
    {
      label: "Projects submitted",
      value: data.submissions.total,
      description: "Current project submissions",
    },
  ];

  const adminMetrics: MetricCardProps[] = [
    {
      label: "Accepted applications",
      value: data.applications.accepted,
      description: "Current accepted applications",
    },
    {
      label: "Active participants",
      value: data.checkins.activeParticipants,
      description: "Unique participants with a successful check-in",
    },
    {
      label: "Projects submitted",
      value: data.submissions.total,
      description: "Current project submissions",
    },
  ];

  const metrics = audience === "admin" ? adminMetrics : sponsorMetrics;

  return (
    <div className="space-y-6">
      <div className="space-y-1">
        <h1 className="text-2xl font-bold">
          {audience === "admin" ? "Event analytics" : "Hackathon analytics"}
        </h1>
      </div>

      <div
        className={`grid gap-4 sm:grid-cols-2 ${
          audience === "admin" ? "lg:grid-cols-3" : "lg:grid-cols-4"
        }`}
      >
        {metrics.map((metric) => (
          <MetricCard key={metric.label} {...metric} />
        ))}
      </div>

      {audience === "admin" ? (
        <>
          <Card>
            <CardHeader>
              <CardTitle>Applications by Role</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Role</TableHead>
                    <TableHead className="text-right">Total</TableHead>
                    <TableHead className="text-right">Pending</TableHead>
                    <TableHead className="text-right">Accepted</TableHead>
                    <TableHead className="text-right">Rejected</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {roles.map((role) => {
                    const counts = data.applications.byRole[role];

                    return (
                      <TableRow key={role}>
                        <TableCell className="font-medium">
                          {roleLabels[role]}
                        </TableCell>
                        <TableCell className="text-right tabular-nums">
                          {counts.total.toLocaleString()}
                        </TableCell>
                        <TableCell className="text-right tabular-nums">
                          {counts.pending.toLocaleString()}
                        </TableCell>
                        <TableCell className="text-right tabular-nums">
                          {counts.accepted.toLocaleString()}
                        </TableCell>
                        <TableCell className="text-right tabular-nums">
                          {counts.rejected.toLocaleString()}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          <section className="space-y-4">
            <h2 className="text-lg font-semibold">Participant Demographics</h2>
            <div className="grid gap-4 lg:grid-cols-2">
              {participantDemographicKeys.map((key) => (
                <ParticipantDemographicCard
                  key={key}
                  label={participantDemographicLabels[key]}
                  breakdown={data.applications.participantDemographics[key]}
                />
              ))}
            </div>
          </section>
        </>
      ) : null}
    </div>
  );
}
