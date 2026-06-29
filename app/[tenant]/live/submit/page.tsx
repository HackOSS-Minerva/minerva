import { SubmissionFormPage } from "@/components/live/submit/submission-form-page";
import { withAuth } from "@workos-inc/authkit-nextjs";

interface SubmitRouteProps {
  params: {
    tenant: string;
  };
}

const SubmitRoute = async ({ params }: SubmitRouteProps) => {
  const { tenant } = await params;
  const { user } = await withAuth();

  return (
    <SubmissionFormPage
      tenant={tenant}
      userId={user?.id ?? ""}
      userEmail={user?.email ?? ""}
    />
  );
};

export default SubmitRoute;
