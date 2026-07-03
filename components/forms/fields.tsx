"use client";
import { CardContent } from "@/components/ui/card";
import { FieldGroup } from "@/components/ui/field";
import { useFields } from "@/hooks/use-fields";
import { useForm } from "@tanstack/react-form";
import { useParams } from "next/navigation";
import { useFormLock } from "@/hooks/use-form-lock";
import { toast } from "sonner";

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
