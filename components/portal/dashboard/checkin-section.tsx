import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { IconCheck } from "@tabler/icons-react";
import { Badge } from "@/components/ui/badge";
import { QRCodeSVG } from "qrcode.react";
import { buildCheckinQrPayload, type CheckinQrIdentity } from "@/lib/checkin";

interface CheckinSectionProps {
  /**
   * The signed-in user's real identity, fetched server-side from the session.
   * `null` when signed out — the card then shows a sign-in prompt instead of
   * a placeholder QR, so every code shown here scans to a real attendee.
   */
  user: CheckinQrIdentity | null;
}

// Server Component: static card + copy; the QR is built from the server
// session props so no hardcoded guest identity can ever leak into a code.
export function CheckinSection({ user }: CheckinSectionProps) {
  const hasCheckedIn = false; // TODO: wire up real check-in status
  const qrValue = user ? buildCheckinQrPayload(user) : null;

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle>Check-in</CardTitle>
        {hasCheckedIn && (
          <Badge
            variant="secondary"
            className="bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500/20 border-emerald-500/20 flex items-center gap-1 font-semibold"
          >
            <IconCheck className="h-3 w-3" />
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
          <div className="flex min-h-[180px] items-center justify-center rounded-lg border border-dashed px-6 text-center text-sm text-muted-foreground">
            Sign in to view your check-in QR code.
          </div>
        )}
      </CardContent>
    </Card>
  );
}
