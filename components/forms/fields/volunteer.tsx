import * as z from "zod";

import { availabilities } from "@/data/information";
import {
  checkboxGridField,
  demographicFields,
  identityFields,
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
  id: "volunteer-form",
};

export const schema = z.object({
  _id: idSchema,
  firstname: firstnameSchema,
  lastname: lastnameSchema,
  email: emailSchema,
  telephone: telephoneSchema,
  discord: discordSchema,
  gender: genderSchema,
  shirt: shirtSchema,
  dietrestriction: dietrestrictionSchema,

  availabilities: z
    .array(z.enum(availabilities))
    .min(1, "Please select at least one availability."),

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
  ...demographicFields(),
  checkboxGridField({
    name: "availabilities",
    label: "Availabilities",
    options: availabilities,
  }),
  termsField({ checkboxValueProp: "value" }),
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
