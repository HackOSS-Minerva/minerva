import * as z from "zod";

import { affiliations } from "@/data/information";
import {
  demographicFields,
  fileField,
  identityFields,
  radioField,
  textField,
  termsField,
  type FieldDef,
  dietrestrictionSchema,
  emailSchema,
  firstnameSchema,
  genderSchema,
  idSchema,
  lastnameSchema,
  shirtSchema,
  statusSchema,
  telephoneSchema,
  termsSchema,
} from "./shared";

export const metadata = {
  id: "speaker-form",
};

export const schema = z.object({
  _id: idSchema,

  firstname: firstnameSchema,

  lastname: lastnameSchema,

  email: emailSchema,

  telephone: telephoneSchema,

  affiliation: z.enum(affiliations, "Please select a valid affiliation"),

  title: z
    .string()
    .min(2, "Title must be at least 2 characters.")
    .max(32, "Title must be at most 32 characters."),

  organization: z
    .string()
    .min(2, "Organization must be at least 2 characters.")
    .max(32, "Organization must be at most 32 characters."),

  gender: genderSchema,

  shirt: shirtSchema,

  dietrestriction: dietrestrictionSchema,

  picture: z.file().max(800_000, "Profile picture must be less than 800KB."),

  terms: termsSchema,

  status: statusSchema,
});

export const fields: FieldDef[] = [
  ...identityFields(),
  radioField({
    name: "affiliation",
    label: "Affiliation",
    options: affiliations,
  }),
  textField({
    name: "title",
    label: "Title",
    placeholder: "Associate Professor",
    maxLength: 32,
  }),
  textField({
    name: "organization",
    label: "Organization",
    placeholder: "ie. UC Riverside",
    maxLength: 32,
  }),
  ...demographicFields(),
  fileField({
    name: "picture",
    label: "Profile Picture",
    accept: "image/*",
    required: true,
  }),
  termsField(),
];

export const defaultValues = {
  firstname: "",
  lastname: "",
  email: "",
  telephone: "",
  affiliation: "",
  title: "",
  organization: "",
  gender: "",
  shirt: "",
  dietrestriction: "",
  terms: false,
  status: "PENDING",
};
