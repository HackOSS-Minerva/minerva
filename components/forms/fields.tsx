"use client";
import { CardContent } from "@/components/ui/card";
import { FieldGroup } from "@/components/ui/field";
import { useFields, type FormValues } from "@/hooks/use-fields";
import { useForm, type DeepKeys } from "@tanstack/react-form";
import { useParams } from "next/navigation";
import { useFormLock } from "@/hooks/use-form-lock";
import { toast } from "sonner";
import { useEffect, useMemo, useRef } from "react";
import { authClient } from "@/lib/auth-client";
import { triggerConfetti } from "@/hooks/use-confetti";

/** Seeds the form's identity fields from the session's `name` + `email`,
 * splitting the name into first token / rest so multi-word last names survive. */
function useSessionIdentity() {
  const { data: session } = authClient.useSession();
  const user = session?.user;

  return useMemo(() => {
    const email = user?.email ?? "";
    const fullName = user?.name?.trim() ?? "";
    const parts = fullName ? fullName.split(/\s+/) : [];
    const firstname = parts.length > 0 ? parts[0] : "";
    // Everything after the first token becomes the last name so multi-word
    // last names are preserved (e.g. "Anna Marie Lopez" -> "Anna" / "Marie Lopez").
    const lastname = parts.length > 1 ? parts.slice(1).join(" ") : "";
    return { firstname, lastname, email };
  }, [user?.name, user?.email]);
}

const Fields = () => {
  const { form } = useParams<{ form: string }>();
  const {
    form: { fields, metadata, schema, defaultValues },
    onSubmit,
  } = useFields();

  const { isLocked } = useFormLock({ form: form ?? "participant" });

  const identity = useSessionIdentity();

  // Seed defaults with the signed-in user's identity so the name/email fields
  // are pre-populated when the session is available at mount.
  const initialValues = useMemo(() => {
    if (!identity.firstname && !identity.lastname && !identity.email) {
      return defaultValues;
    }
    return {
      ...defaultValues,
      firstname: identity.firstname || defaultValues.firstname,
      lastname: identity.lastname || defaultValues.lastname,
      email: identity.email || defaultValues.email,
    };
  }, [defaultValues, identity]);

  const formInstance = useForm({
    defaultValues: initialValues,
    validators: {
      onSubmit: schema,
    },
    onSubmit: async ({ value }) => {
      if (isLocked) return;
      toast.success(
        `Thank you for applying. We will send you an application update shortly!`,
      );
      triggerConfetti();
      // The onSubmit validator above already narrowed `value` to this slug's
      // zod schema; TanStack still types it from the string placeholders.
      onSubmit(value as FormValues);
    },
  });

  // `useForm` only reads `defaultValues` at mount, so when the session resolves
  // later (the common case) apply the identity via `reset` — at most once, and
  // only while the identity fields are still empty.
  const didPrefill = useRef(false);
  useEffect(() => {
    if (didPrefill.current) return;
    if (!identity.firstname && !identity.lastname && !identity.email) return;

    const current = formInstance.state.values;
    const needsPrefill =
      !current.firstname && !current.lastname && !current.email;

    if (needsPrefill) {
      formInstance.reset(initialValues);
      didPrefill.current = true;
    }
    // Deps intentionally exclude `formInstance` (stable) and `initialValues`.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [identity]);

  return (
    <CardContent>
      <form
        id={metadata.id}
        onSubmit={(e) => {
          e.preventDefault();
          if (!isLocked) formInstance.handleSubmit();
        }}
      >
        <FieldGroup>
          <FieldGroup>
            {fields.map(({ name, children }, key) => (
              <formInstance.Field
                key={key}
                name={name as DeepKeys<typeof initialValues>}
              >
                {(fieldApi) => {
                  const child = children(fieldApi);
                  if (
                    isLocked &&
                    child &&
                    typeof child === "object" &&
                    "props" in child
                  ) {
                    return {
                      ...child,
                      props: {
                        ...(child.props || {}),
                        disabled: true,
                      },
                    };
                  }
                  return child;
                }}
              </formInstance.Field>
            ))}
          </FieldGroup>
        </FieldGroup>
      </form>
    </CardContent>
  );
};

export default Fields;
