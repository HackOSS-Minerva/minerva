"use client";

import { useTenant } from "@/hooks/use-tenant";
import { HeroSection } from "@/components/live/dashboard/hero-section";
import { ScheduleSection } from "@/components/live/dashboard/schedule-section";
import { CheckinSection } from "@/components/live/dashboard/checkin-section";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Check, Clock, X, UserRound } from "lucide-react";
import Link from "next/link";

interface JudgeDashboardPageProps {
  tenant: string;
  judgeStatus: "ACCEPTANCE" | "PENDING" | "REJECTION" | null;
}

export function JudgeDashboardPage({
  tenant,
  judgeStatus,
}: JudgeDashboardPageProps) {
  const { live } = useTenant();

  if (!live) {
    return (
      <div className="flex flex-col items-center justify-center px-4 py-16 text-center">
        <h1 className="text-2xl font-bold">Judge Dashboard</h1>
        <p className="text-center text-2xl font-bold">👋 Hello, Guest User</p>
        <p className="mt-2 text-muted-foreground">
          Live event information is not available yet.
        </p>
      </div>
    );
  }

  const renderStatusCard = () => {
    switch (judgeStatus) {
      case "ACCEPTANCE":
        return (
          <Card className="border-green-500/50 bg-green-50 dark:bg-green-950/20">
            <CardHeader className="flex flex-row items-center gap-4 pb-2">
              <div className="rounded-full bg-green-500/10 p-2">
                <Check className="h-6 w-6 text-green-600 dark:text-green-400" />
              </div>
              <div>
                <CardTitle className="text-lg text-green-700 dark:text-green-300">
                  Accepted
                </CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-green-700/80 dark:text-green-300/80">
                Your judge application has been accepted. You now have access to
                all judge resources, including assignments, project submissions,
                and judging materials.
              </p>
            </CardContent>
          </Card>
        );
      case "PENDING":
        return (
          <Card className="border-yellow-500/50 bg-yellow-50 dark:bg-yellow-950/20">
            <CardHeader className="flex flex-row items-center gap-4 pb-2">
              <div className="rounded-full bg-yellow-500/10 p-2">
                <Clock className="h-6 w-6 text-yellow-600 dark:text-yellow-400" />
              </div>
              <div>
                <CardTitle className="text-lg text-yellow-700 dark:text-yellow-300">
                  Application Pending
                </CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-yellow-700/80 dark:text-yellow-300/80">
                Your judge application is being reviewed. We&apos;ll notify you
                once a decision has been made. You can continue to explore the
                dashboard while you wait.
              </p>
            </CardContent>
          </Card>
        );
      case "REJECTION":
        return (
          <Card className="border-red-500/50 bg-red-50 dark:bg-red-950/20">
            <CardHeader className="flex flex-row items-center gap-4 pb-2">
              <div className="rounded-full bg-red-500/10 p-2">
                <X className="h-6 w-6 text-red-600 dark:text-red-400" />
              </div>
              <div>
                <CardTitle className="text-lg text-red-700 dark:text-red-300">
                  Application Not Selected
                </CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-red-700/80 dark:text-red-300/80">
                Thank you for your interest in judging. Unfortunately, your
                application was not selected for this event. You can still
                explore the general event dashboard.
              </p>
            </CardContent>
          </Card>
        );
      default:
        return (
          <Card className="border-muted bg-muted/30">
            <CardHeader className="flex flex-row items-center gap-4 pb-2">
              <div className="rounded-full bg-muted p-2">
                <UserRound className="h-6 w-6 text-muted-foreground" />
              </div>
              <div>
                <CardTitle className="text-lg">Not Applied</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="flex flex-col gap-3">
              <p className="text-sm text-muted-foreground">
                You haven&apos;t submitted a judge application yet. Apply now to
                become a judge for this event and gain access to assignments,
                submissions, and judging materials.
              </p>
              <div>
                <Button asChild size="sm">
                  <Link href={`/${tenant}/forms/judge`}>
                    Apply to be a Judge
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        );
    }
  };

  return (
    <div className="space-y-6">
      <p className="text-center text-2xl font-bold">👋 Hello, Guest User</p>

      {renderStatusCard()}
      <Separator className="my-6" />

      <HeroSection startTime={live.startTime} endTime={live.endTime} />
      <Separator className="my-6" />

      <CheckinSection tenant={tenant} />
      <Separator className="my-6" />

      <ScheduleSection />
    </div>
  );
}
