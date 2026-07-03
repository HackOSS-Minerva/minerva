"use client";

import { useTenant } from "@/hooks/use-tenant";
import { JudgeNav } from "@/components/judge/judge-nav";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { FormLockModal } from "@/components/forms/form-lock-modal";

interface RegisterPageProps {
  tenant: string;
}

export function RegisterPage({ tenant }: RegisterPageProps) {
  const { tenant: tenantConfig } = useTenant();
  const JudgeHeader = tenantConfig ? null : null;

  return (
    <div className="mx-auto max-w-4xl space-y-6 px-4 py-6 md:py-10">
      <JudgeNav tenant={tenant} />
      <FormLockModal form="judge" />

      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-bold">Judge Registration</h1>
        <p className="text-sm text-muted-foreground">
          Thank you for your interest in judging. Please review the
          information below and complete the registration form.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>About Judging</CardTitle>
          <CardDescription>
            Judges evaluate projects based on creativity, technical
            complexity, and presentation. Your feedback helps recognize
            outstanding work.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4 text-sm text-muted-foreground">
          <p>
            Judges are not required to stay the full duration of the event,
            but are encouraged to check out the various events, workshops,
            and opportunities that are available.
          </p>
          <p>
            Judge duties include but are not limited to visiting various
            teams to assess teams on their idea, technical complexities, and
            overall presentation after which they will decide the winners.
          </p>
          <p className="text-xs">
            Note: Judges are not permitted to become participants for the
            designathon.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
