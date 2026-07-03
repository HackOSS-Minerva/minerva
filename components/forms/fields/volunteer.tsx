import {
  Field,
  FieldContent,
  FieldError,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import * as z from "zod";
import {
  availabilities,
  dietrestrictions,
  genders,
  shirts,
} from "@/data/information";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { resources, terms } from "@/data/terms";
import Link from "next/link";
import { SquareArrowOutUpRight } from "lucide-react";
import { statuses } from "@/data/status";

export const metadata = {
  id: "volunteer-form",
};

export const schema = z.object({
  _id: z.optional(z.number()),
  firstname: z
    .string()
    .min(2, "First name must be at least 2 characters.")
    .max(32, "First name must be at most 32 characters."),

  lastname: z
    .string()
    .min(2, "Last name must be at least 2 characters.")
    .max(32, "Last name must be at most 32 characters."),

  email: z
    .email("Please enter a valid email address.")
    .max(64, "Email must be at most 64 characters."),

  telephone: z
    .string()
    .regex(/^[+]?[\d\s().-]{7,20}$/, "Please enter a valid phone number."),

  discord: z
    .string()
    .min(2, "Discord username must be at least 2 characters.")
    .max(32, "Discord username must be at most 32 characters."),

  gender: z.enum(genders, "Please select a valid gender."),

  shirt: z.enum(shirts, "Please select a valid shirt."),

  dietrestriction: z.enum(
    dietrestrictions,
    "Please select a valid diet restriction.",
  ),

  availabilities: z
    .array(z.enum(availabilities))
    .min(1, "Please select at least one availability."),

  terms: z.literal(true, "You must accept the terms and conditions."),

  status: z.enum(statuses),
});

export const fields = [
  {
    name: "firstname",
    children: (field: any) => {
      const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid;
      return (
        <Field data-invalid={isInvalid}>
          <FieldLabel htmlFor={field.name} className="text-primary">
            First Name<span className="text-destructive">*</span>
          </FieldLabel>
          <Input
            className="text-primary"
            id={field.name}
            name={field.name}
            value={field.state.value}
            onBlur={field.handleBlur}
            onChange={(e) => field.handleChange(e.target.value)}
            aria-invalid={isInvalid}
            placeholder="John"
            required
            autoComplete="off"
          />
          {isInvalid && <FieldError errors={field.state.meta.errors} />}
        </Field>
      );
    },
  },
  {
    name: "lastname",
    children: (field: any) => {
      const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid;
      return (
        <Field data-invalid={isInvalid}>
          <FieldLabel htmlFor={field.name} className="text-primary">
            Last Name<span className="text-destructive">*</span>
          </FieldLabel>
          <Input
            className="text-primary"
            id={field.name}
            name={field.name}
            value={field.state.value}
            onBlur={field.handleBlur}
            onChange={(e) => field.handleChange(e.target.value)}
            aria-invalid={isInvalid}
            placeholder="Doe"
            required
            autoComplete="off"
          />
          {isInvalid && <FieldError errors={field.state.meta.errors} />}
        </Field>
      );
    },
  },
  {
    name: "email",
    children: (field: any) => {
      const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid;
      return (
        <Field data-invalid={isInvalid}>
          <FieldLabel htmlFor={field.name} className="text-primary">
            Email Address<span className="text-destructive">*</span>
          </FieldLabel>
          <Input
            className="text-primary"
            id={field.name}
            name={field.name}
            value={field.state.value}
            onBlur={field.handleBlur}
            onChange={(e) => field.handleChange(e.target.value)}
            aria-invalid={isInvalid}
            placeholder="john.doe@gmail.com"
            required
            autoComplete="off"
          />
          {isInvalid && <FieldError errors={field.state.meta.errors} />}
        </Field>
      );
    },
  },
  {
    name: "telephone",
    children: (field: any) => {
      const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid;
      return (
        <Field data-invalid={isInvalid}>
          <FieldLabel htmlFor={field.name} className="text-primary">
            Phone Number<span className="text-destructive">*</span>
          </FieldLabel>
          <Input
            className="text-primary"
            id={field.name}
            name={field.name}
            value={field.state.value}
            onBlur={field.handleBlur}
            onChange={(e) => field.handleChange(e.target.value)}
            aria-invalid={isInvalid}
            placeholder="123 456 7890"
            required
            autoComplete="off"
          />
          {isInvalid && <FieldError errors={field.state.meta.errors} />}
        </Field>
      );
    },
  },
  {
    name: "discord",
    children: (field: any) => {
      const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid;
      return (
        <Field data-invalid={isInvalid}>
          <FieldLabel htmlFor={field.name} className="text-primary">
            Discord Username<span className="text-destructive">*</span>
          </FieldLabel>
          <Input
            className="text-primary"
            id={field.name}
            name={field.name}
            value={field.state.value}
            onBlur={field.handleBlur}
            onChange={(e) => field.handleChange(e.target.value)}
            aria-invalid={isInvalid}
            placeholder="john.doe"
            required
            autoComplete="off"
          />
          {isInvalid && <FieldError errors={field.state.meta.errors} />}
        </Field>
      );
    },
  },
  {
    name: "gender",
    children: (field: any) => {
      const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid;
      return (
        <Field data-invalid={isInvalid}>
          <FieldLabel htmlFor={field.name} className="text-primary">
            Gender<span className="text-destructive">*</span>
          </FieldLabel>

          <RadioGroup
            name={field.name}
            value={field.state.value}
            onValueChange={field.handleChange}
            className="grid grid-cols-3"
          >
            {genders.map((gender) => (
              <div className="flex items-center space-x-2" key={gender}>
                <RadioGroupItem value={gender} id={gender} />
                <Label className="text-primary" htmlFor={gender}>
                  {gender}
                </Label>
              </div>
            ))}
          </RadioGroup>
          {isInvalid && <FieldError errors={field.state.meta.errors} />}
        </Field>
      );
    },
  },
  {
    name: "shirt",
    children: (field: any) => {
      const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid;
      return (
        <Field data-invalid={isInvalid}>
          <FieldLabel htmlFor={field.name} className="text-primary">
            Shirt Size<span className="text-destructive">*</span>
          </FieldLabel>

          <RadioGroup
            name={field.name}
            value={field.state.value}
            onValueChange={field.handleChange}
            className="grid grid-cols-3"
          >
            {shirts.map((shirt) => (
              <div className="flex items-center space-x-2" key={shirt}>
                <RadioGroupItem value={shirt} id={shirt} />
                <Label className="text-primary" htmlFor={shirt}>
                  {shirt}
                </Label>
              </div>
            ))}
          </RadioGroup>
          {isInvalid && <FieldError errors={field.state.meta.errors} />}
        </Field>
      );
    },
  },
  {
    name: "dietrestriction",
    children: (field: any) => {
      const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid;
      return (
        <Field data-invalid={isInvalid}>
          <FieldLabel htmlFor={field.name} className="text-primary">
            Diet Restrictions<span className="text-destructive">*</span>
          </FieldLabel>

          <RadioGroup
            name={field.name}
            value={field.state.value}
            onValueChange={field.handleChange}
            className="grid grid-cols-3"
          >
            {dietrestrictions.map((restriction) => (
              <div className="flex items-center space-x-2" key={restriction}>
                <RadioGroupItem value={restriction} id={restriction} />
                <Label className="text-primary" htmlFor={restriction}>
                  {restriction}
                </Label>
              </div>
            ))}
          </RadioGroup>
          {isInvalid && <FieldError errors={field.state.meta.errors} />}
        </Field>
      );
    },
  },
  {
    name: "availabilities",
    children: (field: any) => {
      const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid;
      return (
        <Field data-invalid={isInvalid}>
          <FieldLabel htmlFor={field.name} className="text-primary">
            Availabilities<span className="text-destructive">*</span>
          </FieldLabel>
          <div className="grid grid-cols-2 gap-4">
            {availabilities.map((availability) => (
              <div className="flex items-center space-x-2" key={availability}>
                <Checkbox
                  checked={field.state.value.includes(availability)}
                  onCheckedChange={(checked) => {
                    const currentValue = field.state.value || [];
                    if (checked) {
                      field.handleChange([...currentValue, availability]);
                    } else {
                      field.handleChange(
                        currentValue.filter(
                          (item: string) => item !== availability,
                        ),
                      );
                    }
                  }}
                  id={`availability-${availability}`}
                />
                <Label
                  className="text-primary"
                  htmlFor={`availability-${availability}`}
                >
                  {availability}
                </Label>
              </div>
            ))}
          </div>
          {isInvalid && <FieldError errors={field.state.meta.errors} />}
        </Field>
      );
    },
  },
  {
    name: "terms",
    children: (field: any) => {
      const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid;
      return (
        <Field data-invalid={isInvalid}>
          <FieldLabel htmlFor={field.name} className="text-primary">
            Terms and Conditions<span className="text-destructive">*</span>
          </FieldLabel>
          <FieldContent className="text-sm">
            <ul className="list-disc mx-3 text-primary">
              {terms.map((term) => (
                <li key={term}>{term}</li>
              ))}
            </ul>
          </FieldContent>

          <div className="flex flex-col text-sm">
            {resources.map(({ name, url }) => (
              <Link
                href={url}
                key={name}
                className="flex gap-2 items-center text-primary"
              >
                {name}
                <SquareArrowOutUpRight size={16} />
              </Link>
            ))}
          </div>

          <div className="flex items-start gap-3">
            <Checkbox
              name={field.name}
              value={field.state.value}
              onCheckedChange={field.handleChange}
              id="terms"
            />
            <div className="grid gap-2">
              <Label htmlFor="terms" className="text-primary">
                Accept terms and conditions
              </Label>
              <p className="text-muted-foreground text-sm">
                By clicking this checkbox, you agree to the terms and
                conditions.
              </p>
            </div>
          </div>
          {isInvalid && <FieldError errors={field.state.meta.errors} />}
        </Field>
      );
    },
  },
];

export const defaultValues = {
  firstname: "",
  lastname: "",
  email: "",
  telephone: "",
  discord: "",
  gender: "",
  shirt: "",
  dietrestriction: "",
  availabilities: ["Saturday Morning"],
  terms: false,
  status: "PENDING",
};
