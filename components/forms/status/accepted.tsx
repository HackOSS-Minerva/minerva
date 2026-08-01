import { Card } from "@/components/ui/card";
import { Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

interface AcceptedProps {
  form: string;
  tenant: string;
}

const ACCEPTED_DASHBOARDS: Record<string, string> = {
  superadmin: "/admin/dashboards/participants",
  participant: "/live/dashboard",
  judge: "/judge/dashboard",
  speaker: "",
  volunteer: "",
};

const Accepted = ({ form, tenant }: AcceptedProps) => {
  const dashboardHref = ACCEPTED_DASHBOARDS[form];
  const roleLabel = form.charAt(0).toUpperCase() + form.slice(1);

  return (
    <div className="flex flex-col items-center justify-center gap-4 p-8">
      <Check className="h-12 w-12 text-primary" />
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-bold text-primary">Congratulations!</h2>
        <p className="text-primary">
          Your {roleLabel} application has been accepted. We&apos;re excited to
          have you join us!
        </p>
        {dashboardHref && (
          <Button asChild className="mt-4">
            <Link href={`/${tenant}${dashboardHref}`}>
              Go to {roleLabel} Dashboard
            </Link>
          </Button>
        )}
      </div>
    </div>
  );
};

export default Accepted;
