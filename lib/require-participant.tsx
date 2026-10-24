import Link from "next/link";
import { redirect } from "next/navigation";
import { IconLock } from "@tabler/icons-react";
import { Button } from "@/components/ui/button";
import { fetchAuthQuery } from "@/lib/auth-server";
import { api } from "@/convex/_generated/api";
import { BYPASS_AUTH_IN_DEV } from "@/lib/dev-bypass";
import type { TenantSlug } from "@/hooks/get-tenant";

// Server-side gate matching the navbar lock: only signed-in ACCEPTANCE-status
// participants may view pages behind the locked `Resources` / `Participate`
// dropdowns. `redirectPath` is the absolute path (e.g. `/${tenant}/live/...`)
// used for the post-sign-in redirect.
export async function guardParticipantPage(
  tenant: TenantSlug,
  redirectPath: string,
): Promise<React.ReactNode | null> {
  // Unlocked in dev so local development never needs sign-in.
  if (BYPASS_AUTH_IN_DEV) {
    return null;
  }

  const access = await fetchAuthQuery(api.auth.getParticipantAccess, {
    tenant,
  });

  if (!access.authenticated) {
    redirect(`/${tenant}/sign-in?redirect=${redirectPath}`);
  }

  if (!access.authorized) {
    return <ParticipantLocked status={access.status ?? null} tenant={tenant} />;
  }

  return null;
}

interface ParticipantLockedProps {
  status: string | null;
  tenant: TenantSlug;
}

// Signed-in but not an accepted participant: locked state with
// status-specific messaging instead of the page content.
export function ParticipantLocked({ status, tenant }: ParticipantLockedProps) {
  const message =
    status === "PENDING"
      ? "Your participant registration is still pending approval. Once accepted, you will be able to access this page."
      : status === "REJECTION"
        ? "Your participant application was not accepted, so you cannot access this page for this event."
        : `You are not a registered participant for ${tenant}.`;

  return (
    <div className="flex min-h-[60vh] items-center justify-center p-6">
      <div className="max-w-md space-y-4 text-center">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-muted">
          <IconLock className="h-6 w-6 text-muted-foreground" />
        </div>
        <h1 className="text-2xl font-semibold">Access Restricted</h1>
        <p className="text-muted-foreground">{message}</p>
        {!status ? (
          <Button asChild>
            <Link href={`/${tenant}/forms/participant`}>Apply to be a Participant</Link>
          </Button>
        ) : null}
      </div>
    </div>
  );
}
