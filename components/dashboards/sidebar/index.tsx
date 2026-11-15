"use client";

import * as React from "react";
import {
  RiBarChartLine,
  RiClipboardLine,
  RiFileTextLine,
  RiQrCodeLine,
  RiUserLine,
  RiCalendar2Line,
  RiUser2Line,
  RiMegaphoneLine,
  RiCoinLine,
  RiHeartLine,
  RiMessage2Line,
  RiShieldCheckLine,
  RiCheckLine,
} from "@remixicon/react";
import Image from "next/image";
import { useParams } from "next/navigation";
import { getTenant, type TenantSlug } from "@/hooks/get-tenant";
import { useFeatureFlag } from "@/hooks/use-feature-flags";
import type { FeatureFlagKey } from "@/lib/feature-flags";

import { NavMain } from "@/components/dashboards/sidebar/primary";
import { NavSecondary } from "@/components/dashboards/sidebar/secondary";
import { NavUser } from "@/components/dashboards/sidebar/user";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
} from "@/components/ui/sidebar";
import Link from "next/link";

const data = {
  navUtilities: [
    {
      title: "Analytics",
      url: "/admin/analytics",
      slug: "analytics",
      icon: RiBarChartLine,
    },
    {
      title: "QR Code Generator",
      url: "/admin/utilities/qr-code",
      slug: "qr-code",
      icon: RiQrCodeLine,
    },
    {
      title: "Check-in",
      url: "/admin/checkin",
      slug: "checkin",
      icon: RiShieldCheckLine,
    },
    {
      title: "Schedule",
      url: "/admin/schedule",
      slug: "schedule",
      icon: RiCalendar2Line,
    },
  ],
  navJudging: [
    {
      title: "Submissions",
      url: "/admin/dashboards/submissions",
      slug: "submissions",
      icon: RiClipboardLine,
    },
    {
      title: "Judges",
      url: "/admin/dashboards/judges",
      slug: "judges",
      icon: RiUserLine,
    },
    {
      title: "Assignments",
      url: "/admin/assignments",
      slug: "assignments",
      icon: RiCheckLine,
    },
  ],
  navDashboards: [
    {
      title: "Attendance",
      url: "/admin/dashboards/attendance",
      slug: "attendance",
      icon: RiFileTextLine,
    },
    {
      title: "Participants",
      url: "/admin/dashboards/participants",
      slug: "participants",
      icon: RiUser2Line,
    },
    {
      title: "Speakers",
      url: "/admin/dashboards/speakers",
      slug: "speakers",
      icon: RiMegaphoneLine,
    },
    {
      title: "Superadmins",
      url: "/admin/dashboards/superadmins",
      slug: "superadmins",
      icon: RiCoinLine,
    },
    {
      title: "Volunteers",
      url: "/admin/dashboards/volunteers",
      slug: "volunteers",
      icon: RiHeartLine,
    },
    {
      title: "Feedback",
      url: "/admin/dashboards/feedback",
      slug: "feedback",
      icon: RiMessage2Line,
    },
  ],
  navSecondary: [],
};
export const AppSidebar = ({ ...props }: React.ComponentProps<typeof Sidebar>) => {

const { tenant } = useParams<{ tenant: TenantSlug }>();
  const {
    config: { logo, domain },
  } = getTenant(tenant);

  // Feature-flagged nav entries are hidden entirely when their flag is off.
  const enabled = {
    analytics: useFeatureFlag("analytics").isEnabled,
    assignments: useFeatureFlag("assignments").isEnabled,
  };
  const flagBySlug: Partial<Record<string, FeatureFlagKey>> = {
    analytics: "analytics",
    assignments: "assignments",
  };
  const isFlagEnabled = (slug: string) => {
    const flag = flagBySlug[slug];
    return !flag || enabled[flag];
  };

  return (
    <Sidebar collapsible="offcanvas" {...props}>
      <SidebarHeader>
        <SidebarMenu className="flex items-center justify-center">
          <Link href={domain}>
            <Image src={logo} alt="logo" width={100} height={100} />
          </Link>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavMain label="Dashboards" items={data.navDashboards} />
        <NavMain
          label="Judging"
          items={data.navJudging.filter((item) => isFlagEnabled(item.slug))}
        />
        <NavMain
          label="Utilities"
          items={data.navUtilities.filter((item) => isFlagEnabled(item.slug))}
        />
        <NavSecondary items={data.navSecondary} className="mt-auto" />
      </SidebarContent>
      <SidebarFooter>
        <NavUser />
      </SidebarFooter>
    </Sidebar>
  );
}
