"use client";

import { JudgeNav } from "@/components/judge/judge-nav";
import JudgeOrientationMarkdown from "@/tenants/designverse/descriptions/judge-orientation.mdx";

interface OrientationPageProps {
  tenant: string;
}

export function OrientationPage({ tenant }: OrientationPageProps) {
  return (
    <div className="mx-auto max-w-4xl space-y-6 px-4 py-6 md:py-10">
      <JudgeNav tenant={tenant} />

      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-bold">Judge Orientation</h1>
        <p className="text-sm text-muted-foreground">
          Guidelines, rubrics, and best practices for judging this year&apos;s
          event.
        </p>
      </div>

      <JudgeOrientationMarkdown />
    </div>
  );
}
