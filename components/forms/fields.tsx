"use client";
import { CardContent } from "@/components/ui/card";
import { FieldGroup } from "@/components/ui/field";
import { useFields } from "@/hooks/use-fields";
import { useForm } from "@tanstack/react-form";
import { toast } from "sonner";

const Fields = () => {
  const {
    form: { fields, metadata, schema, defaultValues },
    onSubmit,
    onFirstInteraction,
  } = useFields();

  const formInstance = useForm({
    defaultValues: defaultValues,
    validators: {
      onSubmit: schema,
    },
    onSubmit: async ({ value }) => {
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
          formInstance.handleSubmit();
        }}
        onInput={onFirstInteraction}
      >
        <FieldGroup>
          <FieldGroup>
            {fields.map(({ name, children }, key) => (
              <formInstance.Field key={key} name={name as never}>
                {(fieldApi) => children(fieldApi)}
              </formInstance.Field>
            ))}
          </FieldGroup>
        </FieldGroup>
      </form>
    </CardContent>
  );
};

export default Fields;
