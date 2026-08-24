"use client";

import { useRouter } from "next/navigation";
import { authClient } from "@/lib/auth-client";
import { Button } from "@/components/ui/button";

interface SignOutButtonProps {
  redirectTo: string;
  className?: string;
}

/**
 * A client-side "Sign out" button. The admin layout (a server component)
 * cannot call `authClient.signOut()` directly, so it renders this component.
 * Clicking it clears the session and routes to `redirectTo` (the tenant's
 * sign-in page) so the user can sign in with a different Google account.
 */
export function SignOutButton({ redirectTo, className }: SignOutButtonProps) {
  const router = useRouter();

  const handleSignOut = async () => {
    await authClient.signOut();
    router.push(redirectTo);
    router.refresh();
  };

  return (
    <Button
      onClick={handleSignOut}
      className={`mt-2 inline-block rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground ${className ?? ""}`}
    >
      Sign out
    </Button>
  );
}
