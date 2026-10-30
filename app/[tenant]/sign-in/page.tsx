"use client";

import Image from "next/image";
import { Suspense, useEffect, useState } from "react";
import { use } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { authClient } from "@/lib/auth-client";
import { Button } from "@/components/ui/button";
import type { TenantSlug } from "@/hooks/get-tenant";
import { tenantConfigs } from "@/tenants/generated";

interface SignInPageProps {
  params: Promise<{
    tenant: TenantSlug;
  }>;
}

// Split out so it can be wrapped in `<Suspense>`, which Next.js requires for
// components calling `useSearchParams()` — without it the page de-optimizes and
// the sign-in button's onClick can fail to attach.
const SignInContent = ({ tenant }: { tenant: TenantSlug }) => {
  const router = useRouter();
  const searchParams = useSearchParams();

  const { data: session, isPending } = authClient.useSession();
  const [signingIn, setSigningIn] = useState(false);

  const tenantConfig = tenantConfigs[tenant];
  const tenantName = tenantConfig?.name || tenant;
  const logoUrl = tenantConfig?.logo;
  const tenantDomain = tenantConfig?.domain;

  const redirectTarget = searchParams.get("redirect") ?? `/${tenant}/admin`;

  const handleGoogleSignIn = async () => {
    setSigningIn(true);
    try {
      await authClient.signIn.social({
        provider: "google",
        callbackURL: redirectTarget,
      });
    } catch {
      setSigningIn(false);
    }
  };

  const handleSignOut = async () => {
    await authClient.signOut();
    router.refresh();
  };

  const handleBackToTenant = () => {
    router.push(tenantDomain);
  };

  return (
    <div className="flex min-h-screen items-center justify-center p-6">
      <div className="w-full max-w-sm space-y-2">
        {/* Large, centered logo at the top */}
        <div className="flex justify-center">
          {logoUrl && (
            <Image
              src={logoUrl}
              alt="Logo"
              width={120}
              height={120}
              className="w-28 h-28"
            />
          )}
        </div>

        <div className="space-y-6 text-center">
          <h1 className="text-2xl font-semibold">
            {session?.session ? `Welcome, ${session.user.name || session.user.email}` : "Sign In"}
          </h1>
          {session?.session ? (
            <Button className="w-full" variant="outline" onClick={handleSignOut}>
              Sign out
            </Button>
          ) : (
            <Button className="w-full" onClick={handleGoogleSignIn} disabled={signingIn || isPending}>
              {signingIn ? "Redirecting to Google…" : "Sign in with Google"}
            </Button>
          )}
        </div>

        {/* Back to main tenant page button */}
        <Button
          variant="outline"
          className="w-full"
          onClick={handleBackToTenant}
        >
          Back to {tenantName}
        </Button>
      </div>
    </div>
  );
};

const SignInPage = ({ params }: SignInPageProps) => {
  const { tenant } = use(params);

  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center p-6">
          <div className="w-full max-w-sm space-y-6">
            <div className="space-y-2 text-center">
              <h1 className="text-2xl font-semibold">Sign In</h1>
              <p className="text-muted-foreground text-sm">Loading…</p>
            </div>
          </div>
        </div>
      }
    >
      <SignInContent tenant={tenant} />
    </Suspense>
  );
};

export default SignInPage;
