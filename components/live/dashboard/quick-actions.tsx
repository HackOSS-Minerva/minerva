"use client";

import { useTenant } from "@/hooks/use-tenant";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import {
  IconPackage,
  IconUsers,
  IconUpload,
  IconMapPin,
} from "@tabler/icons-react";

export function QuickActions() {
  const { tenant, name } = useTenant();
  const submissionUrl = tenant.event?.submission.url;

  const actions = [
    {
      label: "View Hackpacks",
      href: `/${name}/live/hackpacks`,
      icon: IconPackage,
    },
    {
      label: "Team Finder",
      href: `/${name}/live/teams`,
      icon: IconUsers,
    },
    {
      label: "Submit Project",
      href: submissionUrl ?? "#",
      icon: IconUpload,
      external: !!submissionUrl,
    },
    {
      label: "Venue Information",
      href: `/${name}/live/dashboard#venue`,
      icon: IconMapPin,
    },
  ];

  return (
    <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
      {actions.map((action) => {
        const Icon = action.icon;
        return action.external ? (
          <a
            key={action.label}
            href={action.href}
            target="_blank"
            rel="noopener noreferrer"
            className="block"
          >
            <Card className="cursor-pointer transition-colors hover:bg-accent">
              <CardContent className="flex flex-col items-center gap-2 py-4 text-center">
                <Icon className="h-6 w-6 text-primary" />
                <span className="text-sm font-medium">{action.label}</span>
              </CardContent>
            </Card>
          </a>
        ) : (
          <Link key={action.label} href={action.href} className="block">
            <Card className="cursor-pointer transition-colors hover:bg-accent">
              <CardContent className="flex flex-col items-center gap-2 py-4 text-center">
                <Icon className="h-6 w-6 text-primary" />
                <span className="text-sm font-medium">{action.label}</span>
              </CardContent>
            </Card>
          </Link>
        );
      })}
    </div>
  );
}