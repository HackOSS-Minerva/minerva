import { redirect } from "next/navigation";
import { SubmissionFormPage } from "@/components/live/submit/submission-form-page";
import { fetchAuthQuery } from "@/lib/auth-server";
import { api } from "@/convex/_generated/api";

interface SubmitRouteProps {
  params: {
    tenant: string;
  };
}

const SubmitRoute = async ({ params }: SubmitRouteProps) => {
  const { tenant } = await params;

  // The project submission form requires a signed-in user — any authenticated
  // account, no role/status check. This is the secure check (validates the
  // session via Convex); the proxy only does an optimistic cookie-existence
  // redirect.
  const { authenticated } = await fetchAuthQuery(api.auth.getAuthStatus, {});
  if (!authenticated) {
    redirect(`/${tenant}/sign-in?redirect=/${tenant}/live/submit`);
  }

  return <SubmissionFormPage tenant={tenant} />;
};

export default SubmitRoute;
