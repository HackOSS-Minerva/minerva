"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { z } from "zod";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Field, FieldLabel, FieldDescription } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { LiveNav } from "@/components/live/live-nav";
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
  IconFileText,
  IconArrowLeft,
} from "@tabler/icons-react";
import { useTenant } from "@/hooks/use-tenant";
import { useAuth } from "@workos-inc/authkit-nextjs/components";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { toast } from "sonner";
import { Separator } from "@/components/ui/separator";

interface SubmissionFormPageProps {
  tenant: string;
  userId: string;
  userEmail: string;
}

export function SubmissionFormPage({
  tenant,
  userId,
  userEmail,
}: SubmissionFormPageProps) {
  const router = useRouter();
  const { headers, tenant: tenantConfig } = useTenant();
  const logo = tenantConfig?.logo;
  const SubmissionHeader = headers?.submission;

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
    const optionalUrl = z.union([z.literal(""), z.url("Please enter a valid URL.")]);
    const submissionSchema = z.object({
      teamName: z.string().min(1, "Team name is required."),
      projectName: z.string().min(1, "Project name is required."),
      description: z.string().min(1, "Project description is required."),
      devpost: z.url("Please enter a valid URL (e.g., https://devpost.com/...)"),
      github: z.array(optionalUrl),
      figma: z.array(optionalUrl),
      canva: z.array(optionalUrl),
      presentation: z.union([z.literal(""), z.url("Please enter a valid presentation URL.")]),
      invites: z.array(z.union([z.literal(""), z.email("Invalid email address format.")])),
    }).refine((data) => {
      const cleanGithub = data.github.filter((l) => l.trim() !== "");
      const cleanFigma = data.figma.filter((l) => l.trim() !== "");
      const cleanCanva = data.canva.filter((l) => l.trim() !== "");
      return cleanGithub.length > 0 || cleanFigma.length > 0 || cleanCanva.length > 0;
    }, {
      message: "At least one GitHub, Figma, or Canva link is required.",
      path: ["links"],
    });

    const result = submissionSchema
      .extend({
        description: z
          .string()
          .min(1, "Project description is required.")
          .max(300, "Description must be under 300 characters.")
          .refine((val) => {
            const sentenceCount = (val.match(/[.!?]+/g) || []).length;
            return sentenceCount >= 1;
          }, "Please provide at least 1 sentence ending with a period, exclamation, or question mark.")
          .refine((val) => {
            const sentenceCount = (val.match(/[.!?]+/g) || []).length;
            return sentenceCount <= 3;
          }, "Please keep the description to 1-3 sentences."),
      })
      .safeParse({
        teamName,
        projectName,
        devpost,
        description,
        github: githubLinks,
        figma: figmaLinks,
        canva: canvaLinks,
      presentation,
      invites,
    });

    if (!result.success) {
      const newErrors: Record<string, string> = {};
      result.error.issues.forEach((issue) => {
        const key = issue.path[0] as string;
        // Group list errors into their respective group keys for UI rendering
        newErrors[key] = issue.message;
      });
      setErrors(newErrors);
      return false;
    }

    setErrors({});
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) {
      toast.error("Please resolve the validation errors in the form.");
      return;
    }

    setSubmitting(true);
    try {
      await addSubmission({
        tenant: tenant.toLowerCase(),
        workos: userId,
        teamName,
        projectName,
        description,
        devpost,
        github: githubLinks.filter((l) => l.trim() !== ""),
        figma: figmaLinks.filter((l) => l.trim() !== ""),
        canva: canvaLinks.filter((l) => l.trim() !== ""),
        presentation: presentation.trim() || undefined,
        invites: invites.filter((email) => email.trim() !== ""),
      });
      toast.success("Project submitted successfully!");
      router.push(`/${tenant}/live/dashboard`);
    } catch (err: any) {
      toast.error(err.message || "An error occurred while saving the submission.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="mx-auto max-w-4xl space-y-6 px-4 py-6 md:py-10">
      <LiveNav tenant={tenant} />
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink href={`/${tenant}/live/dashboard`}>
              Dashboard
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbLink href={`/${tenant}/live/participate`}>
              Participate
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>Submit Project</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>



      <div className="mx-auto max-w-2xl w-full space-y-6">
        <Card className="w-full border-0 shadow-none">
          <CardHeader className="text-center pb-4">
            {SubmissionHeader ? (
              <SubmissionHeader />
            ) : (
              <>
                <CardTitle className="text-2xl font-bold text-primary">Project Submission</CardTitle>
                <CardDescription className="text-sm mt-1.5">
                  Submit your team deliverables and repository links for judging.
                </CardDescription>
              </>
            )}
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              
              {/* Team Name */}
              <Field>
                <FieldLabel htmlFor="teamName" className="text-primary font-medium">
                  Team Name <span className="text-destructive">*</span>
                </FieldLabel>
                <Input
                  id="teamName"
                  value={teamName}
                  onChange={(e) => setTeamName(e.target.value)}
                  placeholder="e.g. Dream Team"
                  className="text-primary mt-1"
                  required
                  autoComplete="off"
                />
                {errors.teamName && (
                  <p className="text-destructive text-sm mt-1">{errors.teamName}</p>
                )}
              </Field>

              {/* Project Name */}
              <Field>
                <FieldLabel htmlFor="projectName" className="text-primary font-medium">
                  Project Name <span className="text-destructive">*</span>
                </FieldLabel>
                <Input
                  id="projectName"
                  value={projectName}
                  onChange={(e) => setProjectName(e.target.value)}
                  placeholder="e.g. Minerva Portal"
                  className="text-primary mt-1"
                  required
                  autoComplete="off"
                />
                {errors.projectName && (
                  <p className="text-destructive text-sm mt-1">{errors.projectName}</p>
                )}
              </Field>

              {/* Project Description */}
              <Field>
                <FieldLabel htmlFor="description" className="text-primary font-medium">
                  Project Description <span className="text-destructive">*</span>
                </FieldLabel>
                <Textarea
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Describe your project in 1-3 sentences..."
                  className="text-primary mt-1"
                  required
                  maxLength={300}
                />
                <p className="text-xs text-muted-foreground mt-1">
                  1-3 sentences, max 300 characters. ({description.length}/300)
                </p>
                {errors.description && (
                  <p className="text-destructive text-sm mt-1">{errors.description}</p>
                )}
              </Field>

              {/* Devpost Link */}
              <Field>
                <FieldLabel htmlFor="devpost" className="text-primary font-medium">
                  Devpost Link <span className="text-destructive">*</span>
                </FieldLabel>
                <Input
                  id="devpost"
                  value={devpost}
                  onChange={(e) => setDevpost(e.target.value)}
                  placeholder="https://devpost.com/software/..."
                  className="text-primary mt-1"
                  required
                  autoComplete="off"
                />
                {errors.devpost && (
                  <p className="text-destructive text-sm mt-1">{errors.devpost}</p>
                )}
              </Field>

              <Separator />

              <div className="space-y-4">
                <div>
                  <h3 className="font-semibold text-primary text-sm flex items-center gap-1">
                    Deliverables & Links <span className="text-destructive">*</span>
                  </h3>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    At least one link from GitHub, Figma, or Canva must be provided.
                  </p>
                  {errors.links && (
                    <div className="mt-2 rounded-md bg-destructive/10 p-2.5 text-sm text-destructive font-medium">
                      {errors.links}
                    </div>
                  )}
                </div>

                {/* GitHub Links */}
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <FieldLabel className="text-primary text-xs font-semibold flex items-center gap-1">
                      <IconBrandGithub className="h-4 w-4" />
                      GitHub Repositories
                    </FieldLabel>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className="h-7 px-2 text-xs"
                      onClick={() => setGithubLinks([...githubLinks, ""])}
                    >
                      <IconPlus className="h-3 w-3 mr-1" /> Add Link
                    </Button>
                  </div>
                  {githubLinks.map((link, idx) => (
                    <div key={idx} className="flex gap-2 items-center">
                      <Input
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
                  {errors.github && (
                    <p className="text-destructive text-xs">{errors.github}</p>
                  )}
                </div>

                {/* Figma Links */}
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <FieldLabel className="text-primary text-xs font-semibold flex items-center gap-1">
                      <IconBrandFigma className="h-4 w-4" />
                      Figma Files
                    </FieldLabel>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className="h-7 px-2 text-xs"
                      onClick={() => setFigmaLinks([...figmaLinks, ""])}
                    >
                      <IconPlus className="h-3 w-3 mr-1" /> Add Link
                    </Button>
                  </div>
                  {figmaLinks.map((link, idx) => (
                    <div key={idx} className="flex gap-2 items-center">
                      <Input
                        value={link}
                        onChange={(e) => {
                          const newLinks = [...figmaLinks];
                          newLinks[idx] = e.target.value;
                          setFigmaLinks(newLinks);
                        }}
                        placeholder="https://figma.com/file/..."
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
                  {errors.figma && (
                    <p className="text-destructive text-xs">{errors.figma}</p>
                  )}
                </div>

                {/* Canva Links */}
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <FieldLabel className="text-primary text-xs font-semibold flex items-center gap-1">
                      <IconLink className="h-4 w-4" />
                      Canva Links
                    </FieldLabel>
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
                        value={link}
                        onChange={(e) => {
                          const newLinks = [...canvaLinks];
                          newLinks[idx] = e.target.value;
                          setCanvaLinks(newLinks);
                        }}
                        placeholder="https://canva.com/design/..."
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
                  {errors.canva && (
                    <p className="text-destructive text-xs">{errors.canva}</p>
                  )}
                </div>
              </div>

              <Separator />

              {/* Presentation Link (Optional) */}

                <Field>
                  <FieldLabel htmlFor="presentation" className="text-primary font-medium flex items-center gap-1">
                    <IconFileText className="h-4 w-4" />
                    Presentation Link <span className="text-xs text-muted-foreground font-normal">(Optional)</span>
                  </FieldLabel>
                  <Input
                    id="presentation"
                    value={presentation}
                    onChange={(e) => setPresentation(e.target.value)}
                    placeholder="https://slides.com/..."
                    className="text-primary mt-1"
                    autoComplete="off"
                  />
                  {errors.presentation && (
                    <p className="text-destructive text-sm mt-1">{errors.presentation}</p>
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
                  <p className="text-destructive text-sm mt-1">{errors.invites}</p>
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
    </div>
  );
}
