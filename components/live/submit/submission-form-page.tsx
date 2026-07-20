"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Field, FieldLabel, FieldDescription, FieldError } from "@/components/ui/field";
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
  IconFileText,
} from "@tabler/icons-react";
import { useTenant } from "@/hooks/use-tenant";
import { Separator } from "@/components/ui/separator";
import { FormLockModal } from "@/components/forms/form-lock-modal";
import { useSubmissions } from "@/hooks/use-submissions";

interface SubmissionFormPageProps {
  tenant: string;
}

export function SubmissionFormPage({
  tenant,
}: SubmissionFormPageProps) {
  const router = useRouter();
  const { form, isLocked } = useSubmissions({ tenant });

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
            onSubmit={(e) => {
              e.preventDefault();
              if (!isLocked) form.handleSubmit();
            }}
            className="flex flex-col gap-6"
          >
            {/* Team Name */}
            <form.Field name="teamName">
              {(field) => {
                const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid;
                return (
                  <Field data-invalid={isInvalid}>
                    <FieldLabel htmlFor={field.name} className="text-primary">
                      Team Name<span className="text-destructive">*</span>
                    </FieldLabel>
                    <Input
                      id={field.name}
                      name={field.name}
                      value={field.state.value}
                      onChange={(e) => field.handleChange(e.target.value)}
                      onBlur={field.handleBlur}
                      placeholder="Enter your team name"
                      disabled={isLocked || form.state.isSubmitting}
                      autoComplete="off"
                      aria-invalid={isInvalid}
                    />
                    {isInvalid && <FieldError errors={field.state.meta.errors} />}
                  </Field>
                );
              }}
            </form.Field>

            {/* Project Name */}
            <form.Field name="projectName">
              {(field) => {
                const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid;
                return (
                  <Field data-invalid={isInvalid}>
                    <FieldLabel htmlFor={field.name} className="text-primary">
                      Project Name<span className="text-destructive">*</span>
                    </FieldLabel>
                    <Input
                      id={field.name}
                      name={field.name}
                      value={field.state.value}
                      onChange={(e) => field.handleChange(e.target.value)}
                      onBlur={field.handleBlur}
                      placeholder="Enter your project name"
                      disabled={isLocked || form.state.isSubmitting}
                      autoComplete="off"
                      aria-invalid={isInvalid}
                    />
                    {isInvalid && <FieldError errors={field.state.meta.errors} />}
                  </Field>
                );
              }}
            </form.Field>

            {/* Description */}
            <form.Field name="description">
              {(field) => {
                const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid;
                return (
                  <Field data-invalid={isInvalid}>
                    <FieldLabel htmlFor={field.name} className="text-primary">
                      Project Description<span className="text-destructive">*</span>
                    </FieldLabel>
                    <FieldDescription>
                      Briefly describe what your project does and what problem it solves.
                    </FieldDescription>
                    <Textarea
                      id={field.name}
                      name={field.name}
                      value={field.state.value}
                      onChange={(e) => field.handleChange(e.target.value)}
                      onBlur={field.handleBlur}
                      placeholder="Describe your project..."
                      rows={4}
                      disabled={isLocked || form.state.isSubmitting}
                      className="w-full"
                      aria-invalid={isInvalid}
                    />
                    {isInvalid && <FieldError errors={field.state.meta.errors} />}
                  </Field>
                );
              }}
            </form.Field>

            {/* Devpost */}
            <form.Field name="devpost">
              {(field) => {
                const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid;
                return (
                  <Field data-invalid={isInvalid}>
                    <FieldLabel htmlFor={field.name} className="text-primary">
                      Devpost URL<span className="text-destructive">*</span>
                    </FieldLabel>
                    <Input
                      id={field.name}
                      name={field.name}
                      value={field.state.value}
                      onChange={(e) => field.handleChange(e.target.value)}
                      onBlur={field.handleBlur}
                      placeholder="https://devpost.com/..."
                      disabled={isLocked || form.state.isSubmitting}
                      autoComplete="off"
                      aria-invalid={isInvalid}
                    />
                    {isInvalid && <FieldError errors={field.state.meta.errors} />}
                  </Field>
                );
              }}
            </form.Field>

            <Separator />

            {/* GitHub Links */}
            <form.Field name="github">
              {(field) => {
                const links = field.state.value;
                const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid;
                return (
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
                        onClick={() => field.handleChange([...links, ""])}
                        disabled={isLocked || form.state.isSubmitting}
                      >
                        <IconPlus className="h-3 w-3 mr-1" /> Add Repo
                      </Button>
                    </div>
                    {links.map((link, idx) => (
                      <div key={idx} className="flex gap-2 items-center">
                        <Input
                          type="url"
                          value={link}
                          onChange={(e) => {
                            const newLinks = [...links];
                            newLinks[idx] = e.target.value;
                            field.handleChange(newLinks);
                          }}
                          onBlur={field.handleBlur}
                          placeholder="https://github.com/..."
                          className="text-primary text-sm"
                          disabled={isLocked || form.state.isSubmitting}
                          autoComplete="off"
                        />
                        {links.length > 1 && (
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className="h-10 w-10 text-muted-foreground hover:text-destructive shrink-0"
                            onClick={() => {
                              field.handleChange(links.filter((_, i) => i !== idx));
                            }}
                            disabled={isLocked || form.state.isSubmitting}
                          >
                            <IconTrash className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    ))}
                    {isInvalid && <FieldError errors={field.state.meta.errors} />}
                  </div>
                );
              }}
            </form.Field>

            <Separator />

            {/* Figma Links */}
            <form.Field name="figma">
              {(field) => {
                const links = field.state.value;
                const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid;
                return (
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <div>
                        <FieldLabel className="text-primary font-medium flex items-center gap-1">
                          <IconBrandFigma className="h-4 w-4" />
                          Figma Designs
                        </FieldLabel>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          Include links to your Figma design files or prototypes.
                        </p>
                      </div>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        className="h-7 px-2 text-xs"
                        onClick={() => field.handleChange([...links, ""])}
                        disabled={isLocked || form.state.isSubmitting}
                      >
                        <IconPlus className="h-3 w-3 mr-1" /> Add Design
                      </Button>
                    </div>
                    {links.map((link, idx) => (
                      <div key={idx} className="flex gap-2 items-center">
                        <Input
                          type="url"
                          value={link}
                          onChange={(e) => {
                            const newLinks = [...links];
                            newLinks[idx] = e.target.value;
                            field.handleChange(newLinks);
                          }}
                          onBlur={field.handleBlur}
                          placeholder="https://figma.com/..."
                          className="text-primary text-sm"
                          disabled={isLocked || form.state.isSubmitting}
                          autoComplete="off"
                        />
                        {links.length > 1 && (
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className="h-10 w-10 text-muted-foreground hover:text-destructive shrink-0"
                            onClick={() => {
                              field.handleChange(links.filter((_, i) => i !== idx));
                            }}
                            disabled={isLocked || form.state.isSubmitting}
                          >
                            <IconTrash className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    ))}
                    {isInvalid && <FieldError errors={field.state.meta.errors} />}
                  </div>
                );
              }}
            </form.Field>

            <Separator />

            {/* Canva Links */}
            <form.Field name="canva">
              {(field) => {
                const links = field.state.value;
                const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid;
                return (
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <div>
                        <FieldLabel className="text-primary font-medium flex items-center gap-1">
                          <IconFileText className="h-4 w-4" />
                          Canva Designs
                        </FieldLabel>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          Include links to your Canva presentations or designs.
                        </p>
                      </div>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        className="h-7 px-2 text-xs"
                        onClick={() => field.handleChange([...links, ""])}
                        disabled={isLocked || form.state.isSubmitting}
                      >
                        <IconPlus className="h-3 w-3 mr-1" /> Add Design
                      </Button>
                    </div>
                    {links.map((link, idx) => (
                      <div key={idx} className="flex gap-2 items-center">
                        <Input
                          type="url"
                          value={link}
                          onChange={(e) => {
                            const newLinks = [...links];
                            newLinks[idx] = e.target.value;
                            field.handleChange(newLinks);
                          }}
                          onBlur={field.handleBlur}
                          placeholder="https://canva.com/..."
                          className="text-primary text-sm"
                          disabled={isLocked || form.state.isSubmitting}
                          autoComplete="off"
                        />
                        {links.length > 1 && (
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className="h-10 w-10 text-muted-foreground hover:text-destructive shrink-0"
                            onClick={() => {
                              field.handleChange(links.filter((_, i) => i !== idx));
                            }}
                            disabled={isLocked || form.state.isSubmitting}
                          >
                            <IconTrash className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    ))}
                    {isInvalid && <FieldError errors={field.state.meta.errors} />}
                  </div>
                );
              }}
            </form.Field>

            <Separator />

            {/* Presentation */}
            <form.Field name="presentation">
              {(field) => {
                const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid;
                return (
                  <Field data-invalid={isInvalid}>
                    <FieldLabel htmlFor={field.name} className="text-primary flex items-center gap-1">
                      <IconLink className="h-4 w-4" />
                      Presentation / Demo Video
                    </FieldLabel>
                    <FieldDescription>
                      Optional link to slides or demo video.
                    </FieldDescription>
                    <Input
                      id={field.name}
                      name={field.name}
                      value={field.state.value}
                      onChange={(e) => field.handleChange(e.target.value)}
                      onBlur={field.handleBlur}
                      placeholder="https://slides.com/..."
                      className="text-primary mt-1"
                      disabled={isLocked || form.state.isSubmitting}
                      autoComplete="off"
                      aria-invalid={isInvalid}
                    />
                    {isInvalid && <FieldError errors={field.state.meta.errors} />}
                  </Field>
                );
              }}
            </form.Field>

            <Separator />

            {/* Invites */}
            <form.Field name="invites">
              {(field) => {
                const emails = field.state.value;
                const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid;
                return (
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
                        onClick={() => field.handleChange([...emails, ""])}
                        disabled={isLocked || form.state.isSubmitting}
                      >
                        <IconPlus className="h-3 w-3 mr-1" /> Add Member
                      </Button>
                    </div>
                    {emails.map((email, idx) => (
                      <div key={idx} className="flex gap-2 items-center">
                        <Input
                          type="email"
                          value={email}
                          onChange={(e) => {
                            const newEmails = [...emails];
                            newEmails[idx] = e.target.value;
                            field.handleChange(newEmails);
                          }}
                          onBlur={field.handleBlur}
                          placeholder={`member${idx + 2}@email.com`}
                          className="text-primary text-sm"
                          disabled={isLocked || form.state.isSubmitting}
                          autoComplete="off"
                        />
                        {emails.length > 1 && (
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className="h-10 w-10 text-muted-foreground hover:text-destructive shrink-0"
                            onClick={() => {
                              field.handleChange(emails.filter((_, i) => i !== idx));
                            }}
                            disabled={isLocked || form.state.isSubmitting}
                          >
                            <IconTrash className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    ))}
                    {isInvalid && <FieldError errors={field.state.meta.errors} />}
                  </div>
                );
              }}
            </form.Field>

            {/* Submit Buttons */}
            <div className="flex justify-end gap-3">
              <Button
                type="button"
                variant="outline"
                onClick={() => router.push(`/${tenant}/live/dashboard`)}
                disabled={isLocked || form.state.isSubmitting}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isLocked || form.state.isSubmitting}>
                {form.state.isSubmitting ? "Submitting..." : "Submit Project"}
              </Button>
            </div>

          </form>
        </CardContent>
      </Card>
    </div>
  );
}