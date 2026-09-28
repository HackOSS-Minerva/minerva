import * as z from "zod";

import { ages, grades, majors, teams } from "@/data/information";
import {
  demographicFields,
  identityFields,
  radioField,
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
  id: "superadmin-form",
};

export const schema = z.object({
  _id: idSchema,
  firstname: firstnameSchema,
  lastname: lastnameSchema,
  email: emailSchema,
  telephone: telephoneSchema,
  discord: discordSchema,
  dietrestriction: dietrestrictionSchema,

  major: z.enum(majors, "Please select a valid major."),

  age: z.enum(ages, "Please select a valid age."),

  grade: z.enum(grades, "Please select a valid grade."),

  team: z.enum(teams, "Please select a valid team."),

  gender: genderSchema,

  shirt: shirtSchema,

  terms: termsSchema,

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
  selectField({ name: "grade", label: "Grade", options: grades }),
  radioField({ name: "team", label: "Team", options: teams }),
  ...demographicFields(),
  termsField({ checkboxValueProp: "value" }),
];

export const defaultValues = {
  firstname: "",
  lastname: "",
  email: "",
  telephone: "",
  discord: "",
  major: "",
  age: "",
  grade: "",
  team: "",
  gender: "",
  shirt: "",
  dietrestriction: "",
  terms: false,
  status: "PENDING",
};
