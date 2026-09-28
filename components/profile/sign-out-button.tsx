"use client";

import { useRouter } from "next/navigation";
import { authClient } from "@/lib/auth-client";
import { Button } from "@/components/ui/button";

interface SignOutButtonProps {
  redirectTo: string;
  className?: string;
}

// Client-side sign-out: the server admin layout can't call `authClient.signOut()`
// directly. Clears the session and routes to `redirectTo` so a different
// Google account can be used.
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
