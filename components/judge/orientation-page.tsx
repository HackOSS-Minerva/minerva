import { getTenant, type TenantSlug } from "@/hooks/get-tenant";
import { FormLockModal } from "@/components/forms/form-lock-modal";

interface OrientationPageProps {
  tenant: TenantSlug;
}

export function OrientationPage({ tenant }: OrientationPageProps) {
  const { markdown } = getTenant(tenant);
  const Markdown = markdown.orientation;
  return (
    <>
      <FormLockModal form="judge-orientation" />
      <div className="space-y-6">
        <div className="flex flex-col gap-1">
          <h1 className="text-2xl font-bold">Judge Orientation</h1>
          <p className="text-sm text-muted-foreground">
            Guidelines, rubrics, and best practices for judging this year&apos;s
            event.
          </p>
        </div>

        <Markdown />
      </div>
    </>
  );
}
