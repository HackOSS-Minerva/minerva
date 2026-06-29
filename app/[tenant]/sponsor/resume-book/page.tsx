import { ResumeBookPage } from "@/components/sponsor/resume-book-page";

interface ResumeBookRouteProps {
  params: {
    tenant: string;
  };
}

const ResumeBookRoute = async ({ params }: ResumeBookRouteProps) => {
  const { tenant } = await params;

  return <ResumeBookPage tenant={tenant} />;
};

export default ResumeBookRoute;
