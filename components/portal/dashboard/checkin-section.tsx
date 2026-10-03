import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { IconCheck } from "@tabler/icons-react";
import { Badge } from "@/components/ui/badge";
import { CheckinQR } from "@/components/portal/dashboard/checkin-qr";

// Hardcoded guest QR payload matching the /checkin page
const guestQR = JSON.stringify({
  id: "visitor",
  firstname: "Guest",
  lastname: "User",
  email: "guest@example.com",
});

// Server Component: static card + copy. Only the QR svg is a client island.
export function CheckinSection() {
  const hasCheckedIn = false; // TODO: wire up real check-in status

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
          Show this QR code at the event check-in desk to verify your
          attendance.
        </p>

        <div className="flex justify-center">
          <div className="rounded-lg bg-white p-4 shadow-sm">
            <CheckinQR value={guestQR} />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
