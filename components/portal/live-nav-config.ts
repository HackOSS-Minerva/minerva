import type { NavItem, DropdownConfig } from "./portal-nav";

export const liveNavItems: NavItem[] = [{ href: "/live/checkin", label: "Check-in" }];

export const liveDropdowns: DropdownConfig[] = [
  {
    label: "Resources",
    items: [
      {
        href: "/live/venue",
        label: "Venue",
        description: "Find location and event details.",
      },
      {
        href: "/live/hackpacks",
        label: "Hackpacks",
        description: "Access tools and resources for your project.",
      },
      {
        href: "/live/dev-tools",
        label: "Dev Tools",
        description: "Browse AI tools, editors, and services.",
      },
      {
        href: "/live/packing-list",
        label: "Packing List",
        description: "Check what to bring to the event.",
      },
      {
        href: "/live/rules",
        label: "Rules",
        description: "Review the hackathon rules and guidelines.",
      },
      {
        href: "/live/code-of-conduct",
        label: "Code of Conduct",
        description: "Understand our community standards.",
      },
    ],
  },
  {
    label: "Participate",
    items: [
      {
        href: "/forms/participant",
        label: "Register",
        description: "Create an account or sign in.",
      },
      {
        href: "/live/teams",
        label: "Team Finder",
        description: "Find teammates with complementary skills.",
      },
      {
        href: "/live/submit",
        label: "Submit Project",
        description: "Submit your finished project details.",
      },
    ],
  },
];
