import { Card } from "@/components/ui/card";
import { X } from "lucide-react";

const Rejected = () => {
  return (
    <Card className="w-full sm:max-w-md border-none">
      <div className="flex flex-col items-center justify-center gap-4 p-8">
        <div className="rounded-full p-2">
          <X className="h-12 w-12 text-primary" />
        </div>
        <div className="text-center space-y-2">
          <h2 className="text-2xl font-bold text-primary">
            Application Rejected
          </h2>
          <p className="text-primary">
            Thank you for your interest. Unfortunately, your application was not
            selected at this time.
          </p>
        </div>
      </div>
    </Card>
  );
};

export default Rejected;
