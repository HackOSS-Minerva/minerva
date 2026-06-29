import { Card } from "@/components/ui/card";
import { Clock } from "lucide-react";

const Pending = () => {
  return (
    <Card className="w-full sm:max-w-md border-none">
      <div className="flex flex-col items-center justify-center gap-4 p-8">
        <div className="rounded-full p-2">
          <Clock className="h-12 w-12 text-primary" />
        </div>
        <div className="text-center space-y-2">
          <h2 className="text-2xl font-bold text-primary">
            Application Pending
          </h2>
          <p className="text-primary">
            Your application is being reviewed. We&apos;ll get back to you soon
            with a decision.
          </p>
        </div>
      </div>
    </Card>
  );
};

export default Pending;
