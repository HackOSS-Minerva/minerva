import { Card, CardTitle, CardContent, CardHeader } from "@/components/ui/card";
import { QRCodeSVG } from "qrcode.react";
import { withAuth } from "@workos-inc/authkit-nextjs";

const Checkin = async () => {
  const { user } = await withAuth();

  if (!user) {
    return (
      <div className="flex min-h-screen items-center justify-center p-4">
        <p className="text-sm text-muted-foreground">
          Please sign in to view your check-in pass.
        </p>
      </div>
    );
  }

  const { id, firstName, lastName, email } = user;
  const firstname = firstName ?? "";
  const lastname = lastName ?? "";
  const qrcode = JSON.stringify({
    id,
    firstname,
    lastname,
    email,
  });

  return (
    <div className="flex justify-center flex-col items-center p-4">
      <Card className="border-none">
        <CardHeader>
          <CardTitle className="text-center text-primary">
            {firstname} {lastname}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="bg-white p-4 rounded-lg">
            {qrcode ? <QRCodeSVG value={qrcode} /> : <div>Loading...</div>}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Checkin;
