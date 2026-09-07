"use client";

import { useForm } from "@tanstack/react-form";
import { useAction, useMutation } from "convex/react";
import { useCallback } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/convex/_generated/api";
import { toast } from "sonner";
import { useFormLock } from "./use-form-lock";
import { z } from "zod";
import { captureAnalyticsEvent } from "@/lib/posthog";
import { triggerConfetti } from "./use-confetti";
import { useTenant } from "./use-tenant";
import type { Id } from "@/convex/_generated/dataModel";
import type {
  SubmissionVettingResult,
  VettingBatchResult,
  VettingEventConfig,
} from "@/lib/vetting/types";
import {
  DEFAULT_GIT_COMMIT_GRACE_WINDOW_MINUTES,
  getSubmissionTeam,
  MAX_TEAM_SIZE,
  TEAM_SIZE_ERROR,
  validateVettingEventConfig,
} from "@/lib/vetting/rules";

export type { VettingBatchResult } from "@/lib/vetting/types";

const optionalUrl = z.union([
  z.literal(""),
  z
    .url("Please enter a valid URL.")
    .max(100, "URL must be 100 characters or less."),
]);

export const submissionSchema = z.object({
  teamName: z
    .string()
    .min(1, "Team name is required.")
    .max(50, "Team name must be 50 characters or less."),
  projectName: z
    .string()
    .min(1, "Project name is required.")
    .max(50, "Project name must be 50 characters or less."),
  description: z
    .string()
    .min(1, "Project description is required.")
    .max(300, "Project description must be 300 characters or less."),
  devpost: z
    .url("Please enter a valid URL (e.g., https://devpost.com/...)")
    .max(100, "URL must be 100 characters or less."),
  github: z.array(optionalUrl),
  figma: z.array(optionalUrl),
  canva: z.array(optionalUrl),
  presentation: z.union([
    z.literal(""),
    z
      .url("Please enter a valid presentation URL.")
      .max(100, "URL must be 100 characters or less."),
  ]),
  invites: z.array(
    z.union([z.literal(""), z.email("Invalid email address format.")]),
  ),
});

export type SubmissionFormData = z.infer<typeof submissionSchema>;

export const defaultValues: SubmissionFormData = {
  teamName: "",
  projectName: "",
  description: "",
  devpost: "",
  github: [""],
  figma: [""],
  canva: [""],
  presentation: "",
  invites: [""],
};

interface UseSubmissionsOptions {
  tenant: string;
}

export function useSubmissions({ tenant }: UseSubmissionsOptions) {
  const router = useRouter();
  const addSubmission = useMutation(api.submissions.add);
  const { isLocked } = useFormLock({ form: "submission" });

  const form = useForm({
    defaultValues,
    validators: {
      onSubmit: submissionSchema,
    },
    onSubmit: async ({ value }) => {
      // Cross-field validation: at least one link across github/figma/canva
      const cleanGithub = value.github.filter((l) => l.trim() !== "");
      const cleanFigma = value.figma.filter((l) => l.trim() !== "");
      const cleanCanva = value.canva.filter((l) => l.trim() !== "");
      if (
        !(
          cleanGithub.length > 0 ||
          cleanFigma.length > 0 ||
          cleanCanva.length > 0
        )
      ) {
        toast.error("At least one GitHub, Figma, or Canva link is required.");
        return;
      }

      const team = getSubmissionTeam(undefined, value.invites);
      if (team.memberCount > MAX_TEAM_SIZE) {
        toast.error(TEAM_SIZE_ERROR);
        return;
      }

      try {
        const result = await addSubmission({
          tenant,
          teamName: value.teamName,
          projectName: value.projectName,
          description: value.description,
          devpost: value.devpost,
          github: cleanGithub,
          figma: cleanFigma,
          canva: cleanCanva,
          presentation: value.presentation || undefined,
          invites: team.normalizedInvites,
        });

        captureAnalyticsEvent("submission_created", {
          tenant,
          entity_id: String(result.id),
        });

        toast.success("Project submitted successfully!");
        triggerConfetti();
        router.push(`/${tenant}/live/dashboard`);
      } catch (error) {
        console.error("Failed to submit project:", error);
        toast.error("Failed to submit project. Please try again.");
      }
    },
  });

  return {
    form,
    isLocked,
  };
}

type SubmissionId = Id<"submissions">;

export function useSubmissionVetting() {
  const { live } = useTenant();
  const vetSubmission = useAction(api.vetting.runSubmissionVetting);
  const vetSubmissions = useAction(api.vetting.runSubmissionVettingMany);

  const getEventConfig = useCallback((): VettingEventConfig => {
    if (!live) {
      throw new Error("Event configuration is unavailable");
    }

    const startsAt = new Date(live.startTime).getTime();
    const submissionDeadlineAt = new Date(live.deadline).getTime();
    const gitCommitGraceWindowMinutes =
      live.gitCommitGraceWindowMinutes ??
      DEFAULT_GIT_COMMIT_GRACE_WINDOW_MINUTES;
    const event = {
      startsAt,
      submissionDeadlineAt,
      gitCommitGraceWindowMinutes,
    };
    validateVettingEventConfig(event);
    return event;
  }, [live]);

  const runVetting = useCallback(
    async (id: string): Promise<SubmissionVettingResult> => {
      return await vetSubmission({
        submissionId: id as SubmissionId,
        event: getEventConfig(),
      });
    },
    [getEventConfig, vetSubmission],
  );

  const runVettingMany = useCallback(
    async (ids: string[]): Promise<VettingBatchResult[]> => {
      return await vetSubmissions({
        submissionIds: ids as SubmissionId[],
        event: getEventConfig(),
      });
    },
    [getEventConfig, vetSubmissions],
  );

  return { runVetting, runVettingMany };
}
