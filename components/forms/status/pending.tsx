import { RiTimeLine } from "@remixicon/react";

const Pending = () => {
  return (
    <div className="flex flex-col items-center justify-center gap-4 p-8">
      <div className="rounded-full p-2">
        <RiTimeLine className="h-12 w-12 text-primary" />
      </div>
      <div className="space-y-2 text-center">
        <h2 className="text-2xl font-bold text-primary">Application Pending</h2>
        <p className="text-primary">
          Your application is being reviewed. We&apos;ll get back to you soon with a decision.
        </p>
      </div>
    </div>
  );
};

export default Pending;
