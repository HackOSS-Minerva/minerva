"use client";
import { CardFooter } from "@/components/ui/card";
import { Field } from "@/components/ui/field";
import { Button } from "@/components/ui/button";
import { useFields } from "@/hooks/use-fields";

const Footer = () => {
  const {
    form: { metadata },
  } = useFields();

  return (
    <CardFooter>
      <Field orientation="horizontal" className="justify-center">
        <Button type="submit" form={metadata.id}>
          Submit
        </Button>
      </Field>
    </CardFooter>
  );
};

export default Footer;
