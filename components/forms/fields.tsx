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
  } = useFields();

  const form = useForm({
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
          form.handleSubmit();
        }}
      >
        <FieldGroup>
          <FieldGroup>
            {fields.map(({ name, children }, key) => (
              <form.Field name={name} children={children} key={key} />
            ))}
          </FieldGroup>
        </FieldGroup>
      </form>
    </CardContent>
  );
};

export default Fields;
