"use client";

import { useState } from "react";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { IconX, IconCheck, IconCopy } from "@tabler/icons-react";
import {
  Users,
  FolderOpen,
  Link as LinkIcon,
  Github,
  Figma,
  Presentation,
  Mail,
  Calendar,
  FileText,
} from "lucide-react";
import DetailRow from "@/components/dashboards/row";
import type { TeamProjectsRow } from "./team-projects-columns";

export function TeamProjectsSheet({
  item,
  children,
}: {
  item: TeamProjectsRow;
  children: React.ReactNode;
}) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    if (item.devpost) {
      navigator.clipboard.writeText(item.devpost);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <Sheet>
      <SheetTrigger asChild>{children}</SheetTrigger>
      <SheetContent side="right" className="flex flex-col gap-0 p-0 sm:max-w-sm">
        <div className="flex items-center justify-between border-b px-6 py-4">
          <SheetHeader className="p-0">
            <SheetTitle className="text-lg">{item.projectName}</SheetTitle>
          </SheetHeader>
        </div>

        <div className="flex-1 space-y-6 overflow-y-auto px-6 py-5">
          <div className="space-y-3">
            <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Overview
            </p>
            <div className="grid gap-3">
              <DetailRow icon={Users} label="Team Name" value={item.teamName} />
              <DetailRow
                icon={FolderOpen}
                label="Project Name"
                value={item.projectName}
              />
              {item.description && (
                <DetailRow
                  icon={FileText}
                  label="Description"
                  value={item.description}
                />
              )}
              <DetailRow
                icon={Calendar}
                label="Submitted"
                value={
                  item.timestamp
                    ? new Date(item.timestamp).toLocaleString("en-US", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                        hour: "numeric",
                        minute: "2-digit",
                        hour12: true,
                      })
                    : "N/A"
                }
              />
            </div>
          </div>

          <hr />

          <div className="space-y-3">
            <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Links
            </p>
            <div className="grid gap-3">
              <DetailRow
                icon={LinkIcon}
                label="Devpost"
                value={
                  item.devpost ? (
                    <a
                      href={item.devpost}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary underline underline-offset-2 break-all hover:opacity-80 transition-opacity"
                    >
                      {item.devpost}
                    </a>
                  ) : (
                    "Not provided"
                  )
                }
                copyable
                onCopy={handleCopy}
                copied={copied}
              />
              {item.github && item.github.length > 0 && (
                <DetailRow
                  icon={Github}
                  label="GitHub"
                  value={
                    <div className="flex flex-col gap-1">
                      {item.github.map((link, i) => (
                        <a
                          key={i}
                          href={link}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-primary underline underline-offset-2 break-all hover:opacity-80 transition-opacity"
                        >
                          {link}
                        </a>
                      ))}
                    </div>
                  }
                />
              )}
              {item.figma && item.figma.length > 0 && (
                <DetailRow
                  icon={Figma}
                  label="Figma"
                  value={
                    <div className="flex flex-col gap-1">
                      {item.figma.map((link, i) => (
                        <a
                          key={i}
                          href={link}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-primary underline underline-offset-2 break-all hover:opacity-80 transition-opacity"
                        >
                          {link}
                        </a>
                      ))}
                    </div>
                  }
                />
              )}
              {item.canva && item.canva.length > 0 && (
                <DetailRow
                  icon={Presentation}
                  label="Canva"
                  value={
                    <div className="flex flex-col gap-1">
                      {item.canva.map((link, i) => (
                        <a
                          key={i}
                          href={link}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-primary underline underline-offset-2 break-all hover:opacity-80 transition-opacity"
                        >
                          {link}
                        </a>
                      ))}
                    </div>
                  }
                />
              )}
              {item.presentation && (
                <DetailRow
                  icon={Presentation}
                  label="Presentation"
                  value={
                    <a
                      href={item.presentation}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary underline underline-offset-2 break-all hover:opacity-80 transition-opacity"
                    >
                      {item.presentation}
                    </a>
                  }
                />
              )}
            </div>
          </div>

          {item.invites && item.invites.length > 0 && (
            <>
              <hr />
              <div className="space-y-3">
                <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  Team
                </p>
                <div className="grid gap-3">
                  <DetailRow
                    icon={Mail}
                    label="Invites"
                    value={
                      <div className="flex flex-col gap-1">
                        {item.invites.map((inv, i) => (
                          <span key={i}>{inv}</span>
                        ))}
                      </div>
                    }
                  />
                </div>
              </div>
            </>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}
