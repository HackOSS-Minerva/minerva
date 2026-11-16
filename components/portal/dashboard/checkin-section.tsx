import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { RiCheckLine } from "@remixicon/react";
import { Badge } from "@/components/ui/badge";
import { QRCodeSVG } from "qrcode.react";
import { buildCheckinQrPayload, type CheckinQrIdentity } from "@/lib/checkin";

interface CheckinSectionProps {
  user: CheckinQrIdentity | null;
  compact?: boolean;
}

// Server Component: static card + copy; the QR is built from the server
// session props so no hardcoded guest identity can ever leak into a code.
export const CheckinSection = ({ user, compact = false }: CheckinSectionProps) => {
  const hasCheckedIn = false; // TODO: wire up real check-in status
  const qrValue = user ? buildCheckinQrPayload(user) : null;

  if (compact) {
    return (
      <section className="space-y-3 lg:pr-5">
        <div className="flex items-center justify-between gap-2">
          <h2 className="text-sm font-semibold">Check-in</h2>
          {hasCheckedIn && (
            <Badge
              variant="secondary"
              className="flex items-center gap-1 border-emerald-500/20 bg-emerald-500/10 font-semibold text-emerald-500 hover:bg-emerald-500/20"
            >
              <RiCheckLine className="h-3 w-3" />
              Checked in
            </Badge>
          )}
        </div>
        <div className="flex items-center gap-3">
          {qrValue ? (
            <div className="shrink-0 rounded-lg bg-white p-2 shadow-sm">
              <QRCodeSVG value={qrValue} size={112} />
            </div>
          ) : (
            <div className="flex min-h-28 flex-1 items-center justify-center rounded-lg border border-dashed px-3 text-center text-sm text-muted-foreground">
              Sign in to view your check-in QR code.
            </div>
          )}
        </div>
      </section>
    );
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0">
        <CardTitle>Check-in</CardTitle>
        {hasCheckedIn && (
          <Badge
            variant="secondary"
            className="flex items-center gap-1 border-emerald-500/20 bg-emerald-500/10 font-semibold text-emerald-500 hover:bg-emerald-500/20"
          >
            <RiCheckLine className="h-3 w-3" />
            Checked in
          </Badge>
        )}
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm text-muted-foreground">
          Show this QR code at the event check-in desk to verify your attendance.
        </p>

        {qrValue ? (
          <div className="flex justify-center">
            <div className="rounded-lg bg-white p-4 shadow-sm">
              <QRCodeSVG value={qrValue} size={180} />
            </div>
          </div>
        ) : (
          <div className="flex min-h-45 items-center justify-center rounded-lg border border-dashed px-6 text-center text-sm text-muted-foreground">
            Sign in to view your check-in QR code.
          </div>
        )}
      </CardContent>
    </Card>
  );
};
