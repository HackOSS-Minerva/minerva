import { redirect } from "next/navigation";
import Link from "next/link";
import { IconLock } from "@tabler/icons-react";
import { SubmissionFormPage } from "@/components/live/submit/submission-form-page";
import { Button } from "@/components/ui/button";
import { fetchAuthQuery } from "@/lib/auth-server";
import { api } from "@/convex/_generated/api";

interface SubmitRouteProps {
  params: {
    tenant: string;
  };
}

const SubmitRoute = async ({ params }: SubmitRouteProps) => {
  const { tenant } = await params;

  // The project submission form requires a signed-in AND accepted participant.
  // This is the secure check (validates the session and participant status via
  // Convex); the proxy only does an optimistic cookie-existence redirect.
  const access = await fetchAuthQuery(api.auth.getParticipantAccess, {
    tenant,
  });

  if (!access.authenticated) {
    redirect(`/${tenant}/sign-in?redirect=/${tenant}/live/submit`);
  }

  if (!access.authorized) {
    // Signed in, but not an accepted participant for this tenant. Show a
    // locked state instead of the submission form, with status-specific
    // messaging (not registered / pending / rejected).
    const message =
      access.status === "PENDING"
        ? "Your participant registration is still pending approval. Once accepted, you will be able to submit your project."
        : access.status === "REJECTION"
          ? "Your participant application was not accepted, so you cannot submit a project for this event."
          : `You are not a registered participant for ${tenant}.`;

    return (
      <div className="flex min-h-[60vh] items-center justify-center p-6">
        <div className="max-w-md space-y-4 text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-muted">
            <IconLock className="h-6 w-6 text-muted-foreground" />
          </div>
          <h1 className="text-2xl font-semibold">Access Restricted</h1>
          <p className="text-muted-foreground">{message}</p>
          {!access.status ? (
            <Button asChild>
              <Link href={`/${tenant}/forms/participant`}>
                Apply to be a Participant
              </Link>
            </Button>
          ) : null}
        </div>
      </div>
    );
  }

  return <SubmissionFormPage tenant={tenant} />;
};

export default SubmitRoute;
