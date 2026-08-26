"use client";

import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { IdeaBoard } from "@/components/live/teams/idea-board";
import { FormLockModal } from "@/components/forms/form-lock-modal";

interface TeamsPageProps {
  tenant: string;
}

export function TeamsPage({ tenant }: TeamsPageProps) {
  return (
    <>
      <FormLockModal form="live-teams" />
      <div className="space-y-8">
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink href={`/${tenant}/live/dashboard`}>
                Dashboard
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>Participate</BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>Team Finder</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
        <div>
          <h1 className="text-2xl font-bold md:text-3xl">Team Finder</h1>
          <p className="mt-1 text-muted-foreground">
            Find teammates and share ideas for your next project.
          </p>
        </div>

        <IdeaBoard tenant={tenant} />
      </div>
    </>
  );
}
