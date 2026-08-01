import { redirect } from "next/navigation";
import Link from "next/link";
import { fetchAuthQuery } from "@/lib/auth-server";
import { api } from "@/convex/_generated/api";

interface AdminLayoutProps {
  children: React.ReactNode;
  params: Promise<unknown>;
}

const Layout = async ({ children, params }: AdminLayoutProps) => {
  const { tenant } = (await params) as { tenant: string };

  // Secure authorization check. The proxy already did an optimistic
  // cookie-existence redirect, but this is the check that actually validates
  // the session (via the authenticated Convex query) and the superadmin role.
  const access = await fetchAuthQuery(api.auth.getAdminAccess, { tenant });

  if (!access.authenticated) {
    redirect(`/${tenant}/sign-in?redirect=/${tenant}/admin`);
  }

  if (!access.authorized) {
    // Signed in with Google, but not an approved superadmin for this tenant.
    return (
      <div className="flex min-h-[60vh] items-center justify-center p-6">
        <div className="max-w-md space-y-3 text-center">
          <h1 className="text-2xl font-semibold">Unauthorized</h1>
          <p className="text-muted-foreground">
            You are signed in, but your account is not approved to manage
            <span className="font-medium"> {tenant}</span>.
            {access.status === "PENDING" ? (
              <> Your superadmin registration is still pending approval.</>
            ) : null}
          </p>
          <Link
            href={`/${tenant}/sign-in?redirect=/${tenant}/admin`}
            className="mt-2 inline-block rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground"
          >
            Use a different account
          </Link>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};

export default Layout;

