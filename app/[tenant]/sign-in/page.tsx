"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { use } from "react";
import { authClient } from "@/lib/auth-client";
import { Button } from "@/components/ui/button";

interface SignInPageProps {
  params: Promise<{ tenant: string }>;
}

/**
 * The interactive sign-in content. This is split into its own component so it
 * can be wrapped in `<Suspense>`, which Next.js requires for any component
 * that calls `useSearchParams()`. Without the Suspense boundary the page
 * de-optimizes client rendering and the sign-in button's onClick can fail to
 * attach (so clicking "Sign in with Google" does nothing / no redirect).
 */
const SignInContent = ({ tenant }: { tenant: string }) => {
  const router = useRouter();
  const searchParams = useSearchParams();

  const { data: session, isPending } = authClient.useSession();
  const [signingIn, setSigningIn] = useState(false);

  const redirectTarget =
    searchParams.get("redirect") ?? `/${tenant}/admin`;

  // If already signed in, send them to their redirect target.
  useEffect(() => {
    if (!isPending && session?.session) {
      router.push(redirectTarget);
    }
  }, [isPending, session, redirectTarget, router]);

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

  return (
    <div className="flex min-h-screen items-center justify-center p-6">
      <div className="w-full max-w-sm space-y-6">
        <div className="space-y-2 text-center">
          <h1 className="text-2xl font-semibold">Sign In</h1>
          <p className="text-muted-foreground text-sm">
            Sign in with Google to continue with{" "}
            <span className="font-medium">{tenant}</span>.
          </p>
        </div>

        {session?.session ? (
          <div className="space-y-3">
            <p className="text-muted-foreground text-center text-sm">
              Signed in as <span className="font-medium">{session.user.email}</span>.
            </p>
            <Button
              className="w-full"
              onClick={() => router.push(redirectTarget)}
            >
              Continue
            </Button>
            <Button
              variant="outline"
              className="w-full"
              onClick={handleSignOut}
            >
              Sign out
            </Button>
          </div>
        ) : (
          <Button
            className="w-full"
            onClick={handleGoogleSignIn}
            disabled={signingIn || isPending}
          >
            {signingIn ? "Redirecting to Google…" : "Sign in with Google"}
          </Button>
        )}
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

