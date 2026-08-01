"use client";

import { ReactNode } from "react";
import { ConvexReactClient } from "convex/react";
import { ConvexProvider } from "convex/react";
import { ConvexBetterAuthProvider } from "@convex-dev/better-auth/react";
import { asAuthClient } from "@/lib/auth-client";

const convex = new ConvexReactClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

export function ConvexClientProvider({
  children,
  initialToken,
}: {
  children: ReactNode;
  initialToken?: string | null;
}) {
  return (
    <ConvexProvider client={convex}>
      <ConvexBetterAuthProvider
        client={convex}
        authClient={asAuthClient}
        initialToken={initialToken}
      >
        {children}
      </ConvexBetterAuthProvider>
    </ConvexProvider>
  );
}

