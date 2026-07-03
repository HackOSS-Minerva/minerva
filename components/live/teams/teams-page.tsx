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
import { LiveNav } from "@/components/live/live-nav";

interface TeamsPageProps {
  tenant: string;
}

export function TeamsPage({ tenant }: TeamsPageProps) {
  return (
    <div className="mx-auto max-w-4xl space-y-8 px-4 py-6 md:py-10">
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
  );
}
