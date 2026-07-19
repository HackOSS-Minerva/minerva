"use client";
import { CardContent } from "@/components/ui/card";
import { FieldGroup } from "@/components/ui/field";
import { useFields } from "@/hooks/use-fields";
import { useForm } from "@tanstack/react-form";
import { useParams } from "next/navigation";
import { useFormLock } from "@/hooks/use-form-lock";
import { toast } from "sonner";
import type { StandardSchemaV1Issue } from "@tanstack/form-core";

function formatValidationError(fieldName: string, message: string): string {
  // Format field name for better readability
  const formattedField = fieldName
    .replace(/([A-Z])/g, " $1")
    .replace(/^./, (str) => str.toUpperCase())
    .replace(/_/g, " ");
  return `${formattedField}: ${message}`;
}

function formatZodErrors(
  errors: Array<{ path: PropertyKey[]; message: string }>,
): React.ReactNode {
  if (errors.length === 0) return "Please fix the form errors.";

  const formattedErrors = errors.map((error) =>
    formatValidationError(error.path.join("."), error.message),
  );

  if (formattedErrors.length === 1) {
    return formattedErrors[0];
  }

  return (
    <ul className="ml-4 list-disc">
      {formattedErrors.map((error, index) => (
        <li key={index}>{error}</li>
      ))}
    </ul>
  );
}

const Fields = () => {
  const { form } = useParams<{ form: string }>();
  const {
    form: { fields, metadata, schema, defaultValues },
    onSubmit,
  } = useFields();

  const { isLocked } = useFormLock({ form: form ?? "participant" });

  const formInstance = useForm({
    defaultValues: defaultValues,
    validators: {
      onSubmit: schema,
    },
    onSubmit: async ({ value }) => {
      if (isLocked) return;
      toast.success(
        // `Thank you for applying. You will receive a confirmation email shortly at ${value.email}`,
        `Thank you for applying. We will send you an application update shortly!`,
      );
      onSubmit(value);
    },
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    onSubmitInvalid: ({ value: _value, formApi }) => {
      // Get all field errors and show them in a toast
      const allErrors: Array<{ path: PropertyKey[]; message: string }> = [];

      // Get the form-level errors from the schema validation
      const formErrors = formApi.state.errorMap.onSubmit;

      // If there are form-level errors with field-specific issues
      if (formErrors && typeof formErrors === "object") {
        const fieldErrors = (formErrors as { fields?: Record<string, unknown[]> })
          .fields;
        if (fieldErrors) {
          Object.entries(fieldErrors).forEach(([fieldName, issues]) => {
            const errorArray = issues as StandardSchemaV1Issue[];
            errorArray.forEach((issue) => {
              if (issue?.message) {
                allErrors.push({
                  path: [fieldName],
                  message: issue.message,
                });
              }
            });
          });
        }

        // Check for form-level error
        const formLevelError = (formErrors as { form?: unknown }).form;
        if (formLevelError) {
          const formErr = formLevelError as StandardSchemaV1Issue;
          if (formErr?.message && allErrors.length === 0) {
            allErrors.push({
              path: ["form"],
              message: formErr.message,
            });
          }
        }
      }

      // Also check individual field errors (for touched fields)
      // Use formApi.state.fieldMeta which has the derived errors array
      const state = formApi.state as { fieldMeta?: Record<string, { errors?: Array<{ message?: string }> }> };
      Object.entries(state.fieldMeta || {}).forEach(
        ([fieldName, fieldMeta]) => {
          if (
            fieldMeta &&
            "errors" in fieldMeta &&
            fieldMeta.errors &&
            fieldMeta.errors.length > 0
          ) {
            fieldMeta.errors.forEach((error: { message?: string }) => {
              if (error?.message) {
                // Avoid duplicates
                const exists = allErrors.some(
                  (e) => e.path[0] === fieldName && e.message === error.message,
                );
                if (!exists) {
                  allErrors.push({
                    path: [fieldName],
                    message: error.message,
                  });
                }
              }
            });
          }
        },
      );

      if (allErrors.length > 0) {
        toast.error("Please fix the following errors:", {
          description: formatZodErrors(allErrors),
        });
      } else {
        toast.error("Please fill in all required fields correctly.");
      }
    },
  });

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
