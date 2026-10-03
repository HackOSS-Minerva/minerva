"use client";

import { Button } from "@/components/ui/button";
import { useFormLock } from "@/hooks/use-form-lock";

interface SubmitLockButtonProps {
  form: string;
  formId: string;
}

// Client island: only the lock-disabled state needs the browser clock +
// tenant locks. `formId` comes from the server `Footer` shell.
export function SubmitLockButton({ form, formId }: SubmitLockButtonProps) {
  const { isLocked } = useFormLock({ form });

  return (
    <Button type="submit" form={formId} disabled={isLocked}>
      Submit
    </Button>
  );
}
