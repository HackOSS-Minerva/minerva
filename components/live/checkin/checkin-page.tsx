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
import { FormLockModal } from "@/components/forms/form-lock-modal";
import { authClient } from "@/lib/auth-client";

interface CheckinPageProps {
  tenant: string;
}

export function CheckinPage({ tenant }: CheckinPageProps) {
  const { data: session } = authClient.useSession();

  const name = session?.user?.name ?? "hacker";
  const nameParts = name.split(" ");
  const firstname = nameParts[0] ?? "";
  const lastname = nameParts.slice(1).join(" ");

  const qrcode = JSON.stringify({
    id: session?.user?.id ?? "visitor",
    firstname,
    lastname,
    email: session?.user?.email ?? "guest@example.com",
  });

  return (
    <>
      <FormLockModal form="live-checkin" />
      <div className="space-y-6">
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink href={`/${tenant}/live/dashboard`}>
                Dashboard
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbLink href={`/${tenant}/live/checkin`}>
                Participate
              </BreadcrumbLink>
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
            Show your QR code at the event check-in desk to verify your
            attendance.
          </p>
        </div>
        <Card className="border-none">
          <CardHeader>
            <CardTitle className="text-center text-primary">{name}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex justify-center">
              <div className="rounded-lg bg-white p-4 shadow-sm">
                {qrcode ? <QRCodeSVG value={qrcode} /> : <div>Loading...</div>}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </>
  );
}
