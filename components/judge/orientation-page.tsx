"use client";

import { useTenant } from "@/hooks/use-tenant";
import { FormLockModal } from "@/components/forms/form-lock-modal";

interface OrientationPageProps {
  tenant: string;
}

export function OrientationPage({}: OrientationPageProps) {
  const { markdown } = useTenant();
  const Markdown = markdown.orientation;
  return (
    <>
      <FormLockModal form="judge-orientation" />
      <div className="space-y-6">
        <div className="flex flex-col gap-1">
          <h1 className="text-2xl font-bold">Judge Orientation</h1>
          <p className="text-sm text-muted-foreground">
            Guidelines, rubrics, and best practices for judging this year&apos;s
            event.
          </p>
        </div>

        <Markdown />
      </div>
    </>
  );
}
