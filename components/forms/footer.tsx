"use client";
import { CardFooter } from "@/components/ui/card";
import { Field } from "@/components/ui/field";
import { Button } from "@/components/ui/button";
import { useFields } from "@/hooks/use-fields";
import { useParams } from "next/navigation";
import { useFormLock } from "@/hooks/use-form-lock";

const Footer = () => {
  const { form } = useParams<{ form: string }>();
  const {
    form: { metadata },
  } = useFields();

  const { isLocked } = useFormLock({ form: form ?? "participant" });

  return (
    <CardFooter>
      <Field orientation="horizontal" className="justify-center">
        <Button type="submit" form={metadata.id} disabled={isLocked}>
          Submit
        </Button>
      </Field>
    </CardFooter>
  );
};

export default Footer;
