"use client";

import { SponsorNav } from "@/components/sponsor/sponsor-nav";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  IconUsers,
  IconCode,
  IconStar,
  IconBuildingCommunity,
  IconDeviceLaptop,
  IconRosette,
  IconChartBar,
  IconClock,
} from "@tabler/icons-react";

interface SponsorAnalyticsPageProps {
  tenant: string;
}

const dummyMetrics = [
  { label: "Total Applicants", value: "847", icon: IconUsers, change: "+12% from last year" },
  { label: "Accepted Participants", value: "320", icon: IconRosette, change: "38% acceptance rate" },
  { label: "Projects Submitted", value: "89", icon: IconCode, change: "72 projects in review" },
  { label: "Schools Represented", value: "42", icon: IconBuildingCommunity, change: "Across 3 countries" },
  { label: "Avg. Team Size", value: "3.6", icon: IconDeviceLaptop, change: "~25 teams formed" },
  { label: "Avg. Experience Rating", value: "4.2 / 5", icon: IconStar, change: "From participant feedback" },
];

const dummyPrizes = [
  { label: "Total Prize Pool", value: "$25,000", icon: IconChartBar, change: "Across 8 categories" },
  { label: "Hacking Hours Logged", value: "2,160+", icon: IconClock, change: "24-hour hackathon" },
];

export function AnalyticsPage({ tenant }: SponsorAnalyticsPageProps) {
  return (
    <div className="mx-auto max-w-6xl space-y-6 px-4 py-6 md:py-10">
      <SponsorNav tenant={tenant} />

      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-bold">Hackathon Analytics</h1>
        <p className="text-sm text-muted-foreground">
          High-level event statistics and insights.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {dummyMetrics.map((metric) => {
          const Icon = metric.icon;
          return (
            <Card key={metric.label}>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  {metric.label}
                </CardTitle>
                <Icon className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{metric.value}</div>
                <p className="mt-1 text-xs text-muted-foreground">
                  {metric.change}
                </p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        {dummyPrizes.map((metric) => {
          const Icon = metric.icon;
          return (
            <Card key={metric.label}>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  {metric.label}
                </CardTitle>
                <Icon className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{metric.value}</div>
                <p className="mt-1 text-xs text-muted-foreground">
                  {metric.change}
                </p>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
