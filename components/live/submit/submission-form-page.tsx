"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { z } from "zod";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Field, FieldLabel, FieldDescription } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import {
  IconPlus,
  IconTrash,
  IconBrandGithub,
  IconBrandFigma,
  IconLink,
  IconMail,
} from "@tabler/icons-react";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { toast } from "sonner";
import { Separator } from "@/components/ui/separator";
import { FormLockModal } from "@/components/forms/form-lock-modal";

interface SubmissionFormPageProps {
  tenant: string;
}

function getUniqueInviteEmails(invites: string[]): string[] {
  return Array.from(
    new Set(
      invites
        .map((email) => email.trim().toLowerCase())
        .filter((email) => email.length > 0),
    ),
  );
}

export function SubmissionFormPage({ tenant }: SubmissionFormPageProps) {
  const router = useRouter();

  // Form states
  const [teamName, setTeamName] = useState("");
  const [projectName, setProjectName] = useState("");
  const [description, setDescription] = useState("");
  const [devpost, setDevpost] = useState("");
  const [githubLinks, setGithubLinks] = useState<string[]>([""]);
  const [figmaLinks, setFigmaLinks] = useState<string[]>([""]);
  const [canvaLinks, setCanvaLinks] = useState<string[]>([""]);
  const [presentation, setPresentation] = useState("");
  const [invites, setInvites] = useState<string[]>([""]);

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);

  // Mutations
  const addSubmission = useMutation(api.submissions.add);

  const validate = () => {
    const optionalUrl = z.union([
      z.literal(""),
      z.url("Please enter a valid URL."),
    ]);
    const submissionSchema = z
      .object({
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
      })
      .refine(
        (data) => {
          const cleanGithub = data.github.filter((l) => l.trim() !== "");
          const cleanFigma = data.figma.filter((l) => l.trim() !== "");
          const cleanCanva = data.canva.filter((l) => l.trim() !== "");
          return (
            cleanGithub.length > 0 ||
            cleanFigma.length > 0 ||
            cleanCanva.length > 0
          );
        },
        {
          message: "At least one GitHub, Figma, or Canva link is required.",
          path: ["links"],
        },
      );

    const result = submissionSchema.safeParse({
      teamName,
      projectName,
      description,
      devpost,
      github: githubLinks,
      figma: figmaLinks,
      canva: canvaLinks,
      presentation,
      invites,
    });

    if (!result.success) {
      const fieldErrors: Record<string, string> = {};
      for (const issue of result.error.issues) {
        const path = issue.path.join(".");
        fieldErrors[path] = issue.message;
      }
      setErrors(fieldErrors);
      return false;
    }

    const declaredTeamCount = 1 + getUniqueInviteEmails(invites).length;
    if (declaredTeamCount > 4) {
      setErrors({
        invites: "Teams can include at most 4 people including the submitter.",
      });
      return false;
    }

    setErrors({});
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setSubmitting(true);

    try {
      await addSubmission({
        tenant,
        teamName,
        projectName,
        description,
        devpost,
        github: githubLinks.filter((l) => l.trim() !== ""),
        figma: figmaLinks.filter((l) => l.trim() !== ""),
        canva: canvaLinks.filter((l) => l.trim() !== ""),
        presentation: presentation || undefined,
        invites: getUniqueInviteEmails(invites),
      });

      toast.success("Project submitted successfully!");
      router.push(`/${tenant}/live/dashboard`);
    } catch (error) {
      console.error("Failed to submit project:", error);
      toast.error(
        error instanceof Error
          ? error.message
          : "Failed to submit project. Please try again.",
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-8">
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink href={`/${tenant}/live/dashboard`}>
              Dashboard
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>Submit Project</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>
      <div>
        <h1 className="text-2xl font-bold md:text-3xl">Submit Project</h1>
        <p className="mt-1 text-muted-foreground">
          Submit your hackathon project details below.
        </p>
      </div>

      <FormLockModal form="submission" />
      <Card>
        <CardHeader>
          <CardTitle>Project Details</CardTitle>
          <CardDescription>
            Provide your team and project information.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form
            id="submission-form"
            onSubmit={handleSubmit}
            className="flex flex-col gap-6"
          >
            {/* Team Name */}
            <Field>
              <FieldLabel>Team Name</FieldLabel>
              <Input
                value={teamName}
                onChange={(e) => setTeamName(e.target.value)}
                placeholder="Enter your team name"
                required
                disabled={submitting}
                autoComplete="off"
              />
              {errors["teamName"] && (
                <p className="text-destructive text-sm mt-1">
                  {errors["teamName"]}
                </p>
              )}
            </Field>

            {/* Project Name */}
            <Field>
              <FieldLabel>Project Name</FieldLabel>
              <Input
                value={projectName}
                onChange={(e) => setProjectName(e.target.value)}
                placeholder="Enter your project name"
                required
                disabled={submitting}
                autoComplete="off"
              />
              {errors["projectName"] && (
                <p className="text-destructive text-sm mt-1">
                  {errors["projectName"]}
                </p>
              )}
            </Field>

            {/* Description */}
            <Field>
              <FieldLabel>Project Description</FieldLabel>
              <FieldDescription>
                Briefly describe what your project does and what problem it
                solves.
              </FieldDescription>
              <Textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Describe your project..."
                rows={4}
                required
                disabled={submitting}
                className="w-full"
              />
              {errors["description"] && (
                <p className="text-destructive text-sm mt-1">
                  {errors["description"]}
                </p>
              )}
            </Field>

            {/* Devpost */}
            <Field>
              <FieldLabel>Devpost URL</FieldLabel>
              <Input
                value={devpost}
                onChange={(e) => setDevpost(e.target.value)}
                placeholder="https://devpost.com/..."
                required
                disabled={submitting}
                autoComplete="off"
              />
              {errors["devpost"] && (
                <p className="text-destructive text-sm mt-1">
                  {errors["devpost"]}
                </p>
              )}
            </Field>

            <Separator />

            {/* GitHub Links */}
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <div>
                  <FieldLabel className="text-primary font-medium flex items-center gap-1">
                    <IconBrandGithub className="h-4 w-4" />
                    GitHub Repositories
                  </FieldLabel>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Add at least one repository link.
                  </p>
                </div>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="h-7 px-2 text-xs"
                  onClick={() => setGithubLinks([...githubLinks, ""])}
                >
                  <IconPlus className="h-3 w-3 mr-1" /> Add Repo
                </Button>
              </div>
              {githubLinks.map((link, idx) => (
                <div key={idx} className="flex gap-2 items-center">
                  <Input
                    type="url"
                    value={link}
                    onChange={(e) => {
                      const newLinks = [...githubLinks];
                      newLinks[idx] = e.target.value;
                      setGithubLinks(newLinks);
                    }}
                    placeholder="https://github.com/..."
                    className="text-primary text-sm"
                    autoComplete="off"
                  />
                  {githubLinks.length > 1 && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="h-10 w-10 text-muted-foreground hover:text-destructive shrink-0"
                      onClick={() => {
                        setGithubLinks(githubLinks.filter((_, i) => i !== idx));
                      }}
                    >
                      <IconTrash className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              ))}
              {errors["github"] && (
                <p className="text-destructive text-sm mt-1">
                  {errors["github"]}
                </p>
              )}
            </div>

            <Separator />

            {/* Figma Links */}
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <div>
                  <FieldLabel className="text-primary font-medium flex items-center gap-1">
                    <IconBrandFigma className="h-4 w-4" />
                    Figma Designs
                  </FieldLabel>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Add at least one design link if applicable.
                  </p>
                </div>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="h-7 px-2 text-xs"
                  onClick={() => setFigmaLinks([...figmaLinks, ""])}
                >
                  <IconPlus className="h-3 w-3 mr-1" /> Add Design
                </Button>
              </div>
              {figmaLinks.map((link, idx) => (
                <div key={idx} className="flex gap-2 items-center">
                  <Input
                    type="url"
                    value={link}
                    onChange={(e) => {
                      const newLinks = [...figmaLinks];
                      newLinks[idx] = e.target.value;
                      setFigmaLinks(newLinks);
                    }}
                    placeholder="https://figma.com/..."
                    className="text-primary text-sm"
                    autoComplete="off"
                  />
                  {figmaLinks.length > 1 && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="h-10 w-10 text-muted-foreground hover:text-destructive shrink-0"
                      onClick={() => {
                        setFigmaLinks(figmaLinks.filter((_, i) => i !== idx));
                      }}
                    >
                      <IconTrash className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              ))}
              {errors["figma"] && (
                <p className="text-destructive text-sm mt-1">
                  {errors["figma"]}
                </p>
              )}
            </div>

            <Separator />

            {/* Canva Links */}
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <div>
                  <FieldLabel className="text-primary font-medium flex items-center gap-1">
                    <IconLink className="h-4 w-4" />
                    Canva / Other Links
                  </FieldLabel>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Add at least one link if applicable.
                  </p>
                </div>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="h-7 px-2 text-xs"
                  onClick={() => setCanvaLinks([...canvaLinks, ""])}
                >
                  <IconPlus className="h-3 w-3 mr-1" /> Add Link
                </Button>
              </div>
              {canvaLinks.map((link, idx) => (
                <div key={idx} className="flex gap-2 items-center">
                  <Input
                    type="url"
                    value={link}
                    onChange={(e) => {
                      const newLinks = [...canvaLinks];
                      newLinks[idx] = e.target.value;
                      setCanvaLinks(newLinks);
                    }}
                    placeholder="https://canva.com/..."
                    className="text-primary text-sm"
                    autoComplete="off"
                  />
                  {canvaLinks.length > 1 && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="h-10 w-10 text-muted-foreground hover:text-destructive shrink-0"
                      onClick={() => {
                        setCanvaLinks(canvaLinks.filter((_, i) => i !== idx));
                      }}
                    >
                      <IconTrash className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              ))}
              {errors["canva"] && (
                <p className="text-destructive text-sm mt-1">
                  {errors["canva"]}
                </p>
              )}
            </div>

            <Separator />

            {/* Presentation */}
            <Field>
              <FieldLabel>Presentation Link</FieldLabel>
              <FieldDescription>
                Optional link to slides or demo video.
              </FieldDescription>
              <Input
                value={presentation}
                onChange={(e) => setPresentation(e.target.value)}
                placeholder="https://slides.com/..."
                className="text-primary mt-1"
                autoComplete="off"
              />
              {errors.presentation && (
                <p className="text-destructive text-sm mt-1">
                  {errors.presentation}
                </p>
              )}
            </Field>

            <Separator />

            {/* Invites / Emails */}
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <div>
                  <FieldLabel className="text-primary font-medium flex items-center gap-1">
                    <IconMail className="h-4 w-4" />
                    Invite Teammates by Email
                  </FieldLabel>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Invited members will be linked to this submission.
                  </p>
                </div>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="h-7 px-2 text-xs"
                  onClick={() => setInvites([...invites, ""])}
                >
                  <IconPlus className="h-3 w-3 mr-1" /> Add Member
                </Button>
              </div>
              {invites.map((email, idx) => (
                <div key={idx} className="flex gap-2 items-center">
                  <Input
                    type="email"
                    value={email}
                    onChange={(e) => {
                      const newInvites = [...invites];
                      newInvites[idx] = e.target.value;
                      setInvites(newInvites);
                    }}
                    placeholder={`member${idx + 2}@email.com`}
                    className="text-primary text-sm"
                    autoComplete="off"
                  />
                  {invites.length > 1 && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="h-10 w-10 text-muted-foreground hover:text-destructive shrink-0"
                      onClick={() => {
                        setInvites(invites.filter((_, i) => i !== idx));
                      }}
                    >
                      <IconTrash className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              ))}
              {errors.invites && (
                <p className="text-destructive text-sm mt-1">
                  {errors.invites}
                </p>
              )}
            </div>

            {/* Submit Buttons */}
            <div className="flex justify-end gap-3">
              <Button
                type="button"
                variant="outline"
                onClick={() => router.push(`/${tenant}/live/dashboard`)}
                disabled={submitting}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={submitting}>
                {submitting ? "Submitting..." : "Submit Project"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
