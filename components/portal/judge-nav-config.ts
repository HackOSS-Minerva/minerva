import type { NavItem, DropdownConfig } from "./portal-nav";
import type { FeatureFlagKey } from "@/lib/feature-flags";

export const judgeNavItems: NavItem[] = [{ href: "/judge/checkin", label: "Check-in" }];

export const judgeDropdowns: DropdownConfig[] = [
  {
    label: "Resources",
    items: [
      {
        href: "/judge/venue",
        label: "Venue",
        description: "Find location and event details.",
      },
      {
        href: "/judge/rules",
        label: "Rules",
        description: "Review the hackathon rules and guidelines.",
      },
      {
        href: "/judge/code-of-conduct",
        label: "Code of Conduct",
        description: "Understand our community standards.",
      },
    ],
  },
  {
    label: "Participate",
    items: [
      {
        href: "/judge/assignments",
        label: "View Assignments",
        description: "See your assigned teams and judging slots.",
        featureFlagKey: "assignments" as FeatureFlagKey,
      },
      {
        href: "/judge/submissions",
        label: "Project Submissions",
        description: "Browse all submitted team projects and demo links.",
      },
      {
        href: "/judge/certificate",
        label: "Certificate",
        description: "Download your certificate of service.",
      },
      {
        href: "/judge/analytics",
        label: "Hackathon Analytics",
        description: "View event statistics and insights.",
        featureFlagKey: "analytics" as FeatureFlagKey,
      },
    ],
  },
];
