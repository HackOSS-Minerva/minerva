import {
  Field,
  FieldContent,
  FieldError,
  FieldLabel,
} from "@/components/ui/field";
import type { FieldApi } from "@tanstack/react-form";
import { Input } from "@/components/ui/input";
import {
  NativeSelect,
  NativeSelectOption,
} from "@/components/ui/native-select";
import * as z from "zod";
import {
  ages,
  dietrestrictions,
  genders,
  grades,
  majors,
  shirts,
} from "../../../data/information";
import { countries } from "@/data/countries";
import { schools } from "@/data/schools";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { resources, terms } from "@/data/terms";
import Link from "next/link";
import { SquareArrowOutUpRight, X } from "lucide-react";
import { statuses } from "@/data/status";

export const metadata = {
  id: "register-form",
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

  major: z.enum(majors, "Please select a valid major."),

  age: z.enum(ages, "Please select a valid age."),

  country: z.enum(countries, "Please select a valid country."),

  school: z.enum(schools, "Please select a valid school."),

  grade: z.enum(grades, "Please select a valid grade."),

  gender: z.enum(genders, "Please select a valid gender."),

  shirt: z.enum(shirts, "Please select a valid shirt."),

  dietrestriction: z.enum(
    dietrestrictions,
    "Please select a valid diet restriction.",
  ),

  resume: z.file().max(250_000).optional(),

  terms: z.literal(true, "You must accept the terms and conditions."),

  mlh: z.boolean(),

  status: z.enum(statuses),
});

export const fields = [
  {
    name: "firstname",
    children: (field: FieldApi<string>) => {
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
    children: (field: FieldApi<string>) => {
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
    children: (field: FieldApi<string>) => {
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
    children: (field: FieldApi<string>) => {
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
    children: (field: FieldApi<string>) => {
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
    name: "major",
    children: (field: FieldApi<string>) => {
      const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid;
      return (
        <Field data-invalid={isInvalid}>
          <FieldLabel htmlFor={field.name} className="text-primary">
            Major<span className="text-destructive">*</span>
          </FieldLabel>
          <NativeSelect
            aria-invalid={isInvalid}
            className="min-w-30"
            name={field.name}
            value={field.state.value}
            onChange={(e) => field.handleChange(e.target.value)}
          >
            <NativeSelectOption value="">Select</NativeSelectOption>
            {majors.map((major) => (
              <NativeSelectOption key={major} value={major}>
                {major}
              </NativeSelectOption>
            ))}
          </NativeSelect>
          {isInvalid && <FieldError errors={field.state.meta.errors} />}
        </Field>
      );
    },
  },
  {
    name: "age",
    children: (field: FieldApi<string>) => {
      const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid;
      return (
        <Field data-invalid={isInvalid}>
          <FieldLabel htmlFor={field.name} className="text-primary">
            Age<span className="text-destructive">*</span>
          </FieldLabel>
          <NativeSelect
            aria-invalid={isInvalid}
            className="min-w-30"
            name={field.name}
            value={field.state.value}
            onChange={(e) => field.handleChange(e.target.value)}
          >
            <NativeSelectOption value="">Select</NativeSelectOption>
            {ages.map((age) => (
              <NativeSelectOption key={age} value={age}>
                {age}
              </NativeSelectOption>
            ))}
          </NativeSelect>
          {isInvalid && <FieldError errors={field.state.meta.errors} />}
        </Field>
      );
    },
  },
  {
    name: "country",
    children: (field: FieldApi<string>) => {
      const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid;
      return (
        <Field data-invalid={isInvalid}>
          <FieldLabel htmlFor={field.name} className="text-primary">
            Country<span className="text-destructive">*</span>
          </FieldLabel>
          <NativeSelect
            aria-invalid={isInvalid}
            className="min-w-30"
            name={field.name}
            value={field.state.value}
            onChange={(e) => field.handleChange(e.target.value)}
          >
            <NativeSelectOption value="">Select</NativeSelectOption>
            {countries.map((country) => (
              <NativeSelectOption key={country} value={country}>
                {country}
              </NativeSelectOption>
            ))}
          </NativeSelect>
          {isInvalid && <FieldError errors={field.state.meta.errors} />}
        </Field>
      );
    },
  },
  {
    name: "school",
    children: (field: FieldApi<string>) => {
      const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid;
      return (
        <Field data-invalid={isInvalid}>
          <FieldLabel htmlFor={field.name} className="text-primary">
            School<span className="text-destructive">*</span>
          </FieldLabel>
          <NativeSelect
            aria-invalid={isInvalid}
            className="min-w-30"
            name={field.name}
            value={field.state.value}
            onChange={(e) => field.handleChange(e.target.value)}
          >
            <NativeSelectOption value="">Select</NativeSelectOption>
            {schools.map((school) => (
              <NativeSelectOption key={school} value={school}>
                {school}
              </NativeSelectOption>
            ))}
          </NativeSelect>
          {isInvalid && <FieldError errors={field.state.meta.errors} />}
        </Field>
      );
    },
  },
  {
    name: "grade",
    children: (field: FieldApi<string>) => {
      const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid;
      return (
        <Field data-invalid={isInvalid}>
          <FieldLabel htmlFor={field.name} className="text-primary">
            Grade<span className="text-destructive">*</span>
          </FieldLabel>
          <NativeSelect
            aria-invalid={isInvalid}
            className="min-w-30"
            name={field.name}
            value={field.state.value}
            onChange={(e) => field.handleChange(e.target.value)}
          >
            <NativeSelectOption value="">Select</NativeSelectOption>
            {grades.map((grade) => (
              <NativeSelectOption key={grade} value={grade}>
                {grade}
              </NativeSelectOption>
            ))}
          </NativeSelect>
          {isInvalid && <FieldError errors={field.state.meta.errors} />}
        </Field>
      );
    },
  },
  {
    name: "gender",
    children: (field: FieldApi<string>) => {
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
    children: (field: FieldApi<string>) => {
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
    children: (field: FieldApi<string>) => {
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
    name: "resume",
    children: (field: FieldApi<string>) => {
      const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid;

      const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const selectedFile = e.target.files?.[0];
        field.handleChange(selectedFile);
      };

      return (
        <Field data-invalid={isInvalid}>
          <FieldLabel htmlFor={field.name} className="text-primary">
            Resume (Optional)
          </FieldLabel>
          <div className="flex items-center gap-4">
            {!field.state.value && (
              <Input
                type="file"
                accept=".pdf"
                onChange={handleFileChange}
                className="text-primary"
                id={field.name}
                name={field.name}
              />
            )}
            {field.state.value && (
              <div className="flex items-center justify-between w-full">
                <span className="text-sm text-muted-foreground">
                  {(field.state.value as File).name}
                </span>
                <button
                  type="button"
                  onClick={() => field.handleChange(null)}
                  className="text-primary"
                >
                  <X size={16} />
                </button>
              </div>
            )}
          </div>
          {isInvalid && <FieldError errors={field.state.meta.errors} />}
        </Field>
      );
    },
  },
  {
    name: "terms",
    children: (field: FieldApi<string>) => {
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
              checked={field.state.value}
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
  {
    name: "mlh",
    children: (field: FieldApi<string>) => {
      const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid;
      return (
        <Field data-invalid={isInvalid}>
          <FieldLabel htmlFor={field.name} className="text-primary">
            Major League Hacking
          </FieldLabel>

          <div className="flex items-start gap-3">
            <Checkbox
              name={field.name}
              checked={field.state.value}
              onCheckedChange={field.handleChange}
              id="mlh"
            />
            <div className="grid gap-2">
              <Label htmlFor="mlh" className="text-primary">
                Subscribe to MLH
              </Label>
              <p className="text-muted-foreground text-sm">
                I authorize MLH to send me occasional emails about relevant
                events, career opportunities, and community announcements.
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
  major: "",
  age: "",
  country: "",
  school: "",
  grade: "",
  gender: "",
  shirt: "",
  dietrestriction: "",
  terms: false,
  mlh: false,
  status: "PENDING",
};
