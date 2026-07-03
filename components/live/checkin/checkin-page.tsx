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
import { LiveNav } from "@/components/live/live-nav";
import { QRCodeSVG } from "qrcode.react";

interface CheckinPageProps {
  tenant: string;
}

export function CheckinPage({ tenant }: CheckinPageProps) {
  const qrcode = JSON.stringify({
    id: "visitor",
    firstname: "Guest",
    lastname: "User",
    email: "guest@example.com",
  });

  return (
    <div className="mx-auto max-w-4xl space-y-6 px-4 py-6 md:py-10">
      <LiveNav tenant={tenant} />
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
          Show your QR code at the event check-in desk to verify your attendance.
        </p>
      </div>
      <Card className="border-none">
        <CardHeader>
          <CardTitle className="text-center text-primary">
            Guest User
          </CardTitle>
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
  );
}