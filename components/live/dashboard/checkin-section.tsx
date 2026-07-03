"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { QRCodeSVG } from "qrcode.react";
import { IconExternalLink, IconCheck } from "@tabler/icons-react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";

interface CheckinSectionProps {
  tenant: string;
}

// Hardcoded guest QR payload matching the /checkin page
const guestQR = JSON.stringify({
  id: "visitor",
  firstname: "Guest",
  lastname: "User",
  email: "guest@example.com",
});

export function CheckinSection({ tenant }: CheckinSectionProps) {
  const hasCheckedIn = false; // TODO: wire up real check-in status

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle>Check-in</CardTitle>
        {hasCheckedIn && (
          <Badge variant="secondary" className="bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500/20 border-emerald-500/20 flex items-center gap-1 font-semibold">
            <IconCheck className="h-3 w-3" />
            Checked in
          </Badge>
        )}
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm text-muted-foreground">
          Show this QR code at the event check-in desk to verify your attendance.
        </p>

        <div className="flex justify-center">
          <div className="rounded-lg bg-white p-4 shadow-sm">
            <QRCodeSVG value={guestQR} size={180} />
          </div>
        </div>

        <div className="flex flex-wrap gap-3">
          <Button asChild variant="outline">
            <Link href={`/${tenant}/live/checkin`}>
              View Full QR Code
              <IconExternalLink className="ml-1 h-4 w-4" />
            </Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
