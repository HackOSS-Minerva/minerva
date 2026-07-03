import { SubmissionFormPage } from "@/components/live/submit/submission-form-page";

interface SubmitRouteProps {
  params: {
    tenant: string;
  };
}

const SubmitRoute = async ({ params }: SubmitRouteProps) => {
  const { tenant } = await params;

  return <SubmissionFormPage tenant={tenant} />;
};

export default SubmitRoute;
