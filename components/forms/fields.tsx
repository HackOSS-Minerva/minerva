"use client";
import { CardContent } from "@/components/ui/card";
import { FieldGroup } from "@/components/ui/field";
import { useFields } from "@/hooks/use-fields";
import { useForm } from "@tanstack/react-form";
import { useParams } from "next/navigation";
import { useFormLock } from "@/hooks/use-form-lock";
import { toast } from "sonner";
import { useEffect, useMemo, useRef } from "react";
import { authClient } from "@/lib/auth-client";
import { triggerConfetti } from "@/hooks/use-confetti";

/**
 * Derives per-field identity values from the Better Auth session user.
 *
 * Google (and most Better Auth social providers) expose a single `name`
 * string plus an `email`. The registration forms collect `firstname`,
 * `lastname`, and `email` separately, so the full name is split into its
 * first token (first name) and the remaining tokens (last name). Both fields
 * remain editable by the user — this only seeds the initial values.
 */
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

  // Seed the form's default values with the signed-in user's identity so the
  // first name, last name, and email fields are auto-populated when the
  // session is already available at mount time. Other fields keep their
  // static defaults.
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
        // `Thank you for applying. You will receive a confirmation email shortly at ${value.email}`,
        `Thank you for applying. We will send you an application update shortly!`,
      );
      triggerConfetti();
      onSubmit(value);
    },
  });

  // `useForm` only consumes `defaultValues` once, at mount. When the session
  // resolves *after* the form has already mounted (the common case, since
  // `authClient.useSession()` is asynchronous), apply the prefilled identity
  // via `reset`. This runs at most once and only when the identity fields are
  // still empty, so it never overwrites values a user has already typed.
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
    // Intentionally excludes `formInstance` (stable) and `initialValues`
    // (memoized alongside `identity`).
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
              <formInstance.Field key={key} name={name as any}>
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
