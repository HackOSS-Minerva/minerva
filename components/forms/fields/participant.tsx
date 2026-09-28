import * as z from "zod";

import { ages, grades, majors } from "@/data/information";
import { countries } from "@/data/countries";
import { schools } from "@/data/schools";
import {
  consentField,
  demographicFields,
  fileField,
  identityFields,
  selectField,
  textField,
  termsField,
  type FieldDef,
  dietrestrictionSchema,
  discordSchema,
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
  id: "register-form",
};

export const schema = z.object({
  _id: idSchema,

  firstname: firstnameSchema,

  lastname: lastnameSchema,

  email: emailSchema,

  telephone: telephoneSchema,

  discord: discordSchema,

  major: z.enum(majors, "Please select a valid major."),

  age: z.enum(ages, "Please select a valid age."),

  country: z.enum(countries, "Please select a valid country."),

  school: z.enum(schools, "Please select a valid school."),

  grade: z.enum(grades, "Please select a valid grade."),

  gender: genderSchema,

  shirt: shirtSchema,

  dietrestriction: dietrestrictionSchema,

  resume: z.file().max(250_000).optional(),

  terms: termsSchema,

  mlh: z.boolean(),

  status: statusSchema,
});

export const fields: FieldDef[] = [
  ...identityFields(),
  textField({
    name: "discord",
    label: "Discord Username",
    placeholder: "john.doe",
    maxLength: 30,
  }),
  selectField({ name: "major", label: "Major", options: majors }),
  selectField({ name: "age", label: "Age", options: ages }),
  selectField({ name: "country", label: "Country", options: countries }),
  selectField({ name: "school", label: "School", options: schools }),
  selectField({ name: "grade", label: "Grade", options: grades }),
  ...demographicFields(),
  fileField({ name: "resume", label: "Resume (Optional)", accept: ".pdf" }),
  termsField(),
  consentField({
    name: "mlh",
    label: "Major League Hacking",
    description:
      "I authorize MLH to send me occasional emails about relevant events, career opportunities, and community announcements.",
  }),
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
