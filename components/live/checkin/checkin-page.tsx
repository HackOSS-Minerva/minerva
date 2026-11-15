"use client";

import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { QRCodeSVG } from "qrcode.react";
import { authClient } from "@/lib/auth-client";
import { buildCheckinQrPayload } from "@/lib/checkin";
import type { TenantSlug } from "@/hooks/get-tenant";

interface CheckinPageProps {
  tenant: TenantSlug;
}

export function CheckinPage({ tenant }: CheckinPageProps) {
  const { data: session, isPending } = authClient.useSession();
  const user = session?.user;

  // Real identity only: until the session resolves (and when signed out) we
  // show a loading/prompt state instead of ever rendering a placeholder QR.
  const qrValue = user
    ? buildCheckinQrPayload({
        id: user.id,
        name: user.name,
        email: user.email,
      })
    : null;
  const displayName = user?.name ?? user?.email ?? null;

  return (
    <div className="space-y-6">
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink href={`/${tenant}/live/dashboard`}>Dashboard</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbLink href={`/${tenant}/live/checkin`}>Participate</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>Check-in</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>
      <div>
        <h1 className="text-2xl font-bold md:text-3xl">Check-in</h1>
        <p className="mt-1 text-muted-foreground">
          Show your QR code at the event check-in desk to verify your attendance.
        </p>
      </div>
      <Card className="border-none">
        <CardHeader>
          <CardTitle className="text-center text-primary">
            {isPending ? "\u00A0" : (displayName ?? "Check-in")}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex justify-center">
            {isPending ? (
              <div className="h-40 w-40 animate-pulse rounded-lg bg-muted" />
            ) : qrValue ? (
              <div className="rounded-lg bg-white p-4 shadow-sm">
                <QRCodeSVG value={qrValue} />
              </div>
            ) : user ? (
              <p className="max-w-xs text-center text-sm text-muted-foreground">
                Your account is missing the email or id needed to build a check-in code. Sign out
                and back in, or contact an organizer.
              </p>
            ) : (
              <p className="max-w-xs text-center text-sm text-muted-foreground">
                Sign in to view your check-in QR code.
              </p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
