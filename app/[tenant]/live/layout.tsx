import { LiveNav } from "@/components/live/live-nav";
import { fetchAuthQuery } from "@/lib/auth-server";
import { api } from "@/convex/_generated/api";

interface LayoutProps {
  children: React.ReactNode;
  params: Promise<unknown>;
}

const Layout = async ({ children, params }: LayoutProps) => {
  const { tenant } = (await params) as { tenant: string };

  // Whether the visitor can access the Participate section: signed in AND an
  // accepted participant. Signed-out / non-accepted users still see it in the
  // menu bar, but grayed out with a lock icon and a "Register to get access"
  // prompt.
  const access = await fetchAuthQuery(api.auth.getParticipantAccess, {
    tenant,
  });

  return (
    <div className="mx-auto max-w-4xl space-y-6 px-4 py-6 md:py-10">
      <LiveNav tenant={tenant} isAuthorized={access.authorized} />
      {children}
    </div>
  );
};

export default Layout;
