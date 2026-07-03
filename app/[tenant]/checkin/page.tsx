import { Card, CardTitle, CardContent, CardHeader } from "@/components/ui/card";
import { QRCodeSVG } from "qrcode.react";

const Checkin = async () => {
  const qrcode = JSON.stringify({
    id: "visitor",
    firstname: "Guest",
    lastname: "User",
    email: "guest@example.com",
  });

  return (
    <div className="flex justify-center flex-col items-center p-4">
      <Card className="border-none">
        <CardHeader>
          <CardTitle className="text-center text-primary">
            Guest User
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
