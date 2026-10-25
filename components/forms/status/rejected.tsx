import { RiCloseLine } from "@remixicon/react";

interface RejectedProps {
  tenantEmail: string;
}

// No `<Card>` here — the form `Wrapper` already renders one around `<Status>`,
// matching the `Accepted`/`Pending` siblings.
const Rejected = ({ tenantEmail }: RejectedProps) => {
  return (
    <div className="flex flex-col items-center justify-center gap-4 p-8">
      <div className="rounded-full p-2">
        <RiCloseLine className="h-12 w-12 text-primary" />
      </div>
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-bold text-primary">Application Rejected</h2>
        <p className="text-primary">
          Thank you for your interest. Unfortunately, your application was not selected at this
          time.
        </p>
        <p className="text-sm text-muted-foreground">
          If you believe this is a mistake, please contact{" "}
          <span className="font-medium">{tenantEmail}</span>.
        </p>
      </div>
    </div>
  );
};

export default Rejected;
