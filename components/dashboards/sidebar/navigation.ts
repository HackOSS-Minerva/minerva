export type DashboardNavigationItem = {
  title: string;
  url: string;
};

export const dashboardNavigation = [
  { title: "Analytics", url: "/admin/analytics" },
  { title: "Attendance", url: "/admin/dashboards/attendance" },
  { title: "Participants", url: "/admin/dashboards/participants" },
  { title: "Speakers", url: "/admin/dashboards/speakers" },
  { title: "Superadmins", url: "/admin/dashboards/superadmins" },
  { title: "Volunteers", url: "/admin/dashboards/volunteers" },
  { title: "Feedback", url: "/admin/dashboards/feedback" },
] as const satisfies readonly DashboardNavigationItem[];
