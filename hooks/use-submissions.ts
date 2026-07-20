"use client";

import { useForm } from "@tanstack/react-form";
import { useMutation } from "convex/react";
import { useRouter } from "next/navigation";
import { api } from "@/convex/_generated/api";
import { toast } from "sonner";
import { useFormLock } from "./use-form-lock";
import { z } from "zod";

const optionalUrl = z.union([
  z.literal(""),
  z.url("Please enter a valid URL."),
]);

export const submissionSchema = z.object({
  teamName: z.string().min(1, "Team name is required."),
  projectName: z.string().min(1, "Project name is required."),
  description: z.string().min(1, "Project description is required."),
  devpost: z.url(
    "Please enter a valid URL (e.g., https://devpost.com/...)",
  ),
  github: z.array(optionalUrl),
  figma: z.array(optionalUrl),
  canva: z.array(optionalUrl),
  presentation: z.union([
    z.literal(""),
    z.url("Please enter a valid presentation URL."),
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
        toast.error(
          "At least one GitHub, Figma, or Canva link is required.",
        );
        return;
      }

      try {
        await addSubmission({
          tenant,
          teamName: value.teamName,
          projectName: value.projectName,
          description: value.description,
          devpost: value.devpost,
          github: cleanGithub,
          figma: cleanFigma,
          canva: cleanCanva,
          presentation: value.presentation || undefined,
          invites: value.invites.filter((e) => e.trim() !== ""),
        });

        toast.success("Project submitted successfully!");
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
