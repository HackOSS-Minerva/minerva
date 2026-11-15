import { FeedbackContent } from "@/components/feedback/feedback-content";
import type { TenantSlug } from "@/hooks/get-tenant";

interface FeedbackPageProps {
  params: Promise<{
    tenant: TenantSlug;
  }>;
}

const FeedbackPage = async ({ params }: FeedbackPageProps) => {
  const { tenant } = await params;

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 p-4">
      <FeedbackContent tenant={tenant} />
    </div>
  );
};

export default FeedbackPage;
