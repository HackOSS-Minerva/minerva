"use client";

import { useParams } from "next/navigation";
import { type TenantSlug } from "@/hooks/get-tenant";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import {
  IconPackage,
  IconUsers,
  IconUpload,
  IconMapPin,
} from "@tabler/icons-react";

export function QuickActions() {
  const { tenant } = useParams<{ tenant: TenantSlug }>();

  const actions = [
    {
      label: "View Hackpacks",
      href: `/${tenant}/live/hackpacks`,
      icon: IconPackage,
    },
    {
      label: "Team Finder",
      href: `/${tenant}/live/teams`,
      icon: IconUsers,
    },
    {
      label: "Submit Project",
      href: `/${tenant}/live/submit`,
      icon: IconUpload,
    },
    {
      label: "Venue Information",
      href: `/${tenant}/live/dashboard#venue`,
      icon: IconMapPin,
    },
  ];

  return (
    <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
      {actions.map((action) => {
        const Icon = action.icon;
        return (
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
