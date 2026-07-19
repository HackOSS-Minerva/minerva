"use client";

import * as React from "react";
import {
  IconCamera,
  IconClipboardList,
  IconDatabase,
  IconFileAi,
  IconFileDescription,
  IconFileWord,
  IconListDetails,
  IconQrcode,
  IconReport,
  IconUserCheck,
} from "@tabler/icons-react";
import Image from "next/image";
import { useTenant } from "@/hooks/use-tenant";

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
      title: "QR Code Generator",
      url: "/admin/utilities/qr-code",
      icon: IconQrcode,
    },
    {
      title: "Check-in",
      url: "/admin/checkin",
      icon: IconQrcode,
    },
    {
      title: "Schedule",
      url: "/admin/schedule",
      icon: IconListDetails,
    },
  ],
  navJudging: [
    {
      title: "Submissions",
      url: "/admin/dashboards/submissions",
      icon: IconClipboardList,
    },
    {
      title: "Judges",
      url: "/admin/dashboards/judges",
      icon: IconListDetails,
    },
    {
      title: "Assignments",
      url: "/admin/assignments",
      icon: IconUserCheck,
    },
  ],
  navDashboards: [
    {
      title: "Attendance",
      url: "/admin/dashboards/attendance",
      icon: IconReport,
    },
    {
      title: "Participants",
      url: "/admin/dashboards/participants",
      icon: IconListDetails,
    },
    {
      title: "Speakers",
      url: "/admin/dashboards/speakers",
      icon: IconListDetails,
    },
    {
      title: "Superadmins",
      url: "/admin/dashboards/superadmins",
      icon: IconListDetails,
    },
    {
      title: "Volunteers",
      url: "/admin/dashboards/volunteers",
      icon: IconListDetails,
    },
    {
      title: "Feedback",
      url: "/admin/dashboards/feedback",
      icon: IconReport,
    },
  ],
  navClouds: [
    {
      title: "Capture",
      icon: IconCamera,
      isActive: true,
      url: "#",
      items: [
        {
          title: "Active Proposals",
          url: "#",
        },
        {
          title: "Archived",
          url: "#",
        },
      ],
    },
    {
      title: "Proposal",
      icon: IconFileDescription,
      url: "#",
      items: [
        {
          title: "Active Proposals",
          url: "#",
        },
        {
          title: "Archived",
          url: "#",
        },
      ],
    },
    {
      title: "Prompts",
      icon: IconFileAi,
      url: "#",
      items: [
        {
          title: "Active Proposals",
          url: "#",
        },
        {
          title: "Archived",
          url: "#",
        },
      ],
    },
  ],
  navSecondary: [
    // {
    //   title: "Settings",
    //   url: "#",
    //   icon: IconSettings,
    // },
  ],
  documents: [
    {
      name: "Data Library",
      url: "#",
      icon: IconDatabase,
    },
    {
      name: "Reports",
      url: "#",
      icon: IconReport,
    },
    {
      name: "Word Assistant",
      url: "#",
      icon: IconFileWord,
    },
  ],
};

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const {
    tenant: { logo, domain },
  } = useTenant();

  return (
    <Sidebar collapsible="offcanvas" {...props}>
      <SidebarHeader>
        <SidebarMenu className="flex items-center justify-center">
          <Link href={domain}>
            <Image src={logo} alt="logo" width={150} height={150} />
          </Link>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavMain label="Dashboards" items={data.navDashboards} />
        <NavMain label="Judging" items={data.navJudging} />
        <NavMain label="Utilities" items={data.navUtilities} />
        <NavSecondary items={data.navSecondary} className="mt-auto" />
      </SidebarContent>
      <SidebarFooter>
        <NavUser />
      </SidebarFooter>
    </Sidebar>
  );
}
