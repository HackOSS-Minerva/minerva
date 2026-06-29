import { Card } from "@/components/ui/card";
import { Check } from "lucide-react";

const Accepted = () => {
  return (
    <Card className="w-full sm:max-w-md border-none">
      <div className="flex flex-col items-center justify-center gap-4 p-8">
        <div className="rounded-full p-2">
          <Check className="h-12 w-12 text-primary" />
        </div>
        <div className="text-center space-y-2">
          <h2 className="text-2xl font-bold text-primary">Congratulations!</h2>
          <p className="text-primary">
            Your application has been accepted. We&apos;re excited to have you
            join us!
          </p>
        </div>
      </div>
    </Card>
  );
};

export default Accepted;
