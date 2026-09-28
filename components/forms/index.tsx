import { redirect } from "next/navigation";
import Wrapper from "./wrapper";
import { slugs } from "@/hooks/use-fields";
import type { TenantSlug } from "@/hooks/get-tenant";
import { fetchAuthQuery } from "@/lib/auth-server";
import { api } from "@/convex/_generated/api";

interface FormProps {
  params: {
    tenant: TenantSlug;
    form: slugs;
  };
}

const Form = async ({ params }: FormProps) => {
  const { tenant, form } = await params;

  // Every registration form requires a signed-in user, no role/status check.
  // Secure check; the proxy only does an optimistic cookie redirect.
  const { authenticated } = await fetchAuthQuery(api.auth.getAuthStatus, {});
  if (!authenticated) {
    redirect(`/${tenant}/sign-in?redirect=/${tenant}/forms/${form}`);
  }

  // If the user is signed in, check their existing status for this form.
  // This prevents users from applying twice and shows status-specific UI.
  const authUser = await fetchAuthQuery(api.auth.getCurrentUser, {});
  const userId = authUser?._id;

  let userStatus: "ACCEPTANCE" | "PENDING" | "REJECTION" | null = null;

  if (userId) {
    const roleApiMap: Record<string, typeof api.participants.getstatus> = {
      participant: api.participants.getstatus,
      judge: api.judges.getstatus,
      speaker: api.speakers.getstatus,
      superadmin: api.superadmins.getstatus,
      volunteer: api.volunteers.getstatus,
    };

    const statusQuery = roleApiMap[form];
    if (statusQuery) {
      const status = await fetchAuthQuery(statusQuery, {
        tenant,
        userId,
      });
      userStatus = status ?? null;
    }
  }

  return (
    <div className="flex justify-center flex-col items-center gap-4">
      <Wrapper form={form} tenant={tenant} userStatus={userStatus} />
    </div>
  );
};

export default Form;
