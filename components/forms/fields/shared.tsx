import {
  Field,
  FieldContent,
  FieldError,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import {
  NativeSelect,
  NativeSelectOption,
} from "@/components/ui/native-select";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { resources, terms } from "@/data/terms";
import { genders, shirts, dietrestrictions } from "@/data/information";
import { statuses } from "@/data/status";
import { SquareArrowOutUpRight, X } from "lucide-react";
import Link from "next/link";
import * as z from "zod";

import type { AnyFieldApi } from "@tanstack/react-form";

/** A form field definition consumed by `components/forms/fields.tsx`. */
export type FieldDef = {
  name: string;
  children: (field: AnyFieldApi) => React.ReactNode;
};

/** Shared zod primitives. Every registration form validates these identically. */
export const idSchema = z.optional(z.number());
export const firstnameSchema = z
  .string()
  .min(2, "First name must be at least 2 characters.")
  .max(30, "First name must be at most 30 characters.");
export const lastnameSchema = z
  .string()
  .min(2, "Last name must be at least 2 characters.")
  .max(30, "Last name must be at most 30 characters.");
export const emailSchema = z
  .email("Please enter a valid email address.")
  .max(64, "Email must be at most 64 characters.");
export const telephoneSchema = z
  .string()
  .regex(/^[+]?[\d\s().-]{7,20}$/, "Please enter a valid phone number.");
export const discordSchema = z
  .string()
  .min(2, "Discord username must be at least 2 characters.")
  .max(30, "Discord username must be at most 30 characters.");
export const genderSchema = z.enum(genders, "Please select a valid gender.");
export const shirtSchema = z.enum(shirts, "Please select a valid shirt.");
export const dietrestrictionSchema = z.enum(
  dietrestrictions,
  "Please select a valid diet restriction.",
);
export const termsSchema = z.literal(
  true,
  "You must accept the terms and conditions.",
);
export const statusSchema = z.enum(statuses);

/** True once a touched field has failed validation. */
const isInvalidField = (field: AnyFieldApi) =>
  field.state.meta.isTouched && !field.state.meta.isValid;

const CharCounter = ({ value, max }: { value: string; max: number }) => (
  <span
    className={`text-xs shrink-0 ${
      value.length >= max
        ? "text-destructive font-medium"
        : "text-muted-foreground"
    }`}
  >
    {value.length}/{max}
  </span>
);

/** Text input; `maxLength` also enables the live character counter. */
export function textField({
  name,
  label,
  placeholder,
  maxLength,
  required = true,
}: {
  name: string;
  label: string;
  placeholder: string;
  maxLength?: number;
  required?: boolean;
}): FieldDef {
  return {
    name,
    children: (field: AnyFieldApi) => {
      const isInvalid = isInvalidField(field);
      return (
        <Field data-invalid={isInvalid}>
          <div className="flex justify-between items-end gap-4">
            <FieldLabel htmlFor={field.name} className="text-primary">
              {label}
              <span className="text-destructive">*</span>
            </FieldLabel>
            {maxLength && (
              <CharCounter value={field.state.value} max={maxLength} />
            )}
          </div>
          <Input
            className="text-primary"
            id={field.name}
            name={field.name}
            value={field.state.value}
            onBlur={field.handleBlur}
            onChange={(e) => field.handleChange(e.target.value)}
            aria-invalid={isInvalid}
            placeholder={placeholder}
            required={required}
            autoComplete="off"
            maxLength={maxLength}
          />
          {isInvalid && <FieldError errors={field.state.meta.errors} />}
        </Field>
      );
    },
  };
}

/** Single-choice radio group over a fixed option list. */
export function radioField({
  name,
  label,
  options,
}: {
  name: string;
  label: string;
  options: readonly string[];
}): FieldDef {
  return {
    name,
    children: (field: AnyFieldApi) => {
      const isInvalid = isInvalidField(field);
      return (
        <Field data-invalid={isInvalid}>
          <FieldLabel htmlFor={field.name} className="text-primary">
            {label}
            <span className="text-destructive">*</span>
          </FieldLabel>
          <RadioGroup
            name={field.name}
            value={field.state.value}
            onValueChange={field.handleChange}
            className="grid grid-cols-3"
          >
            {options.map((option) => (
              <div className="flex items-center space-x-2" key={option}>
                <RadioGroupItem value={option} id={option} />
                <Label className="text-primary" htmlFor={option}>
                  {option}
                </Label>
              </div>
            ))}
          </RadioGroup>
          {isInvalid && <FieldError errors={field.state.meta.errors} />}
        </Field>
      );
    },
  };
}

/** Dropdown over a fixed option list, with a leading placeholder option. */
export function selectField({
  name,
  label,
  options,
}: {
  name: string;
  label: string;
  options: readonly string[];
}): FieldDef {
  return {
    name,
    children: (field: AnyFieldApi) => {
      const isInvalid = isInvalidField(field);
      return (
        <Field data-invalid={isInvalid}>
          <FieldLabel htmlFor={field.name} className="text-primary">
            {label}
            <span className="text-destructive">*</span>
          </FieldLabel>
          <NativeSelect
            aria-invalid={isInvalid}
            className="min-w-30"
            name={field.name}
            value={field.state.value}
            onChange={(e) => field.handleChange(e.target.value)}
          >
            <NativeSelectOption value="">Select</NativeSelectOption>
            {options.map((option) => (
              <NativeSelectOption key={option} value={option}>
                {option}
              </NativeSelectOption>
            ))}
          </NativeSelect>
          {isInvalid && <FieldError errors={field.state.meta.errors} />}
        </Field>
      );
    },
  };
}

/** File picker that swaps to a removable chip once a file is chosen. */
export function fileField({
  name,
  label,
  accept,
  required = false,
}: {
  name: string;
  label: string;
  accept: string;
  required?: boolean;
}): FieldDef {
  return {
    name,
    children: (field: AnyFieldApi) => {
      const isInvalid = isInvalidField(field);

      const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const selectedFile = e.target.files?.[0];
        field.handleChange(required ? selectedFile || null : selectedFile);
      };

      return (
        <Field data-invalid={isInvalid}>
          <FieldLabel htmlFor={field.name} className="text-primary">
            {label}
            {required && <span className="text-destructive">*</span>}
          </FieldLabel>
          <div className="flex items-center gap-4">
            {!field.state.value && (
              <Input
                type="file"
                accept={accept}
                onChange={handleFileChange}
                className="text-primary"
                id={field.name}
                name={field.name}
                required={required}
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
  };
}

/**
 * Terms-and-conditions acceptance checkbox with the required legal copy.
 *
 * `checkboxValueProp` preserves the pre-existing difference between forms:
 * most pass `checked`, while the superadmin and volunteer forms pass `value`.
 */
export function termsField({
  checkboxValueProp = "checked",
}: {
  checkboxValueProp?: "checked" | "value";
} = {}): FieldDef {
  return {
    name: "terms",
    children: (field: AnyFieldApi) => {
      const isInvalid = isInvalidField(field);
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
              {...{ [checkboxValueProp]: field.state.value }}
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
  };
}
/** Boolean consent checkbox with supporting description copy. */
export function consentField({
  name,
  label,
  description,
}: {
  name: string;
  label: string;
  description: string;
}): FieldDef {
  return {
    name,
    children: (field: AnyFieldApi) => {
      const isInvalid = isInvalidField(field);
      return (
        <Field data-invalid={isInvalid}>
          <FieldLabel htmlFor={field.name} className="text-primary">
            {label}
          </FieldLabel>
          <div className="flex items-start gap-3">
            <Checkbox
              name={field.name}
              checked={field.state.value}
              onCheckedChange={field.handleChange}
              id={name}
            />
            <div className="grid gap-2">
              <Label htmlFor={name} className="text-primary">
                {label}
              </Label>
              <p className="text-muted-foreground text-sm">{description}</p>
            </div>
          </div>
          {isInvalid && <FieldError errors={field.state.meta.errors} />}
        </Field>
      );
    },
  };
}

/** Multi-select checkbox grid (used for volunteer availabilities). */
export function checkboxGridField({
  name,
  label,
  options,
}: {
  name: string;
  label: string;
  options: readonly string[];
}): FieldDef {
  return {
    name,
    children: (field: AnyFieldApi) => {
      const isInvalid = isInvalidField(field);
      return (
        <Field data-invalid={isInvalid}>
          <FieldLabel htmlFor={field.name} className="text-primary">
            {label}
            <span className="text-destructive">*</span>
          </FieldLabel>
          <div className="grid grid-cols-2 gap-4">
            {options.map((option) => (
              <div className="flex items-center space-x-2" key={option}>
                <Checkbox
                  checked={field.state.value.includes(option)}
                  onCheckedChange={(checked) => {
                    const currentValue = field.state.value || [];
                    if (checked) {
                      field.handleChange([...currentValue, option]);
                    } else {
                      field.handleChange(
                        currentValue.filter((item: string) => item !== option),
                      );
                    }
                  }}
                  id={`${name}-${option}`}
                />
                <Label className="text-primary" htmlFor={`${name}-${option}`}>
                  {option}
                </Label>
              </div>
            ))}
          </div>
          {isInvalid && <FieldError errors={field.state.meta.errors} />}
        </Field>
      );
    },
  };
}
/** The standard identity block, shared by every registration form. */
export const identityFields = (): FieldDef[] => [
  textField({
    name: "firstname",
    label: "First Name",
    placeholder: "John",
    maxLength: 30,
  }),
  textField({
    name: "lastname",
    label: "Last Name",
    placeholder: "Doe",
    maxLength: 30,
  }),
  textField({
    name: "email",
    label: "Email Address",
    placeholder: "john.doe@gmail.com",
  }),
  textField({
    name: "telephone",
    label: "Phone Number",
    placeholder: "123 456 7890",
  }),
];

/** The standard demographic block, shared by every registration form. */
export const demographicFields = (): FieldDef[] => [
  radioField({ name: "gender", label: "Gender", options: genders }),
  radioField({ name: "shirt", label: "Shirt Size", options: shirts }),
  radioField({
    name: "dietrestriction",
    label: "Diet Restrictions",
    options: dietrestrictions,
  }),
];
