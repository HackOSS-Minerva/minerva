"use client";

import { useConvexAuth, useQuery } from "convex/react";
import { useParams } from "next/navigation";
import { api } from "@/convex/_generated/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getTenant, type TenantSlug } from "@/hooks/get-tenant";

export function HackCreditsCard() {
  const { tenant } = useParams<{ tenant: TenantSlug }>();
  const { isAuthenticated, isLoading } = useConvexAuth();
  const credits = useQuery(api.checkins.getHackCredits, isAuthenticated ? { tenant } : "skip");
  const { config } = getTenant(tenant);
  const pending = isLoading || (isAuthenticated && credits === undefined);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Hack credits</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4" aria-live="polite" aria-busy={pending}>
        {pending ? (
          <p className="text-sm text-muted-foreground">Loading hack credits…</p>
        ) : credits ? (
          <>
            <p className="flex items-baseline gap-2 text-3xl font-bold">
              {credits.balance} <span className="text-base font-normal">credits</span>
            </p>
            <p className="text-sm text-muted-foreground">
              {credits.checkinCount} {credits.checkinCount === 1 ? "check-in" : "check-ins"}
              {" · "}
              {config.hackCreditsPerCheckin} credits each
            </p>
          </>
        ) : (
          <p className="text-sm text-muted-foreground">Sign in to view your hack credits.</p>
        )}
        <p className="text-sm text-muted-foreground">
          Earn {config.hackCreditsPerCheckin} credits for each activity you check into. Credits are
          valid only for {config.name} and cannot transfer to another hackathon.
        </p>
      </CardContent>
    </Card>
  );
}
