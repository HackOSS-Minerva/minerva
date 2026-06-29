import {
  shirts,
  genders,
  grades,
  ages,
  majors,
  teams,
  affiliations,
  availabilities,
  dietrestrictions,
} from "../data/information";
import { countries } from "@/data/countries";
import { schools } from "@/data/schools";
import { statuses } from "@/data/status";
import { Id } from "@/convex/_generated/dataModel";

export type Shirt = (typeof shirts)[number];
export type Gender = (typeof genders)[number];
export type Grade = (typeof grades)[number];
export type Age = (typeof ages)[number];
export type Major = (typeof majors)[number];
export type Team = (typeof teams)[number];
export type Affiliation = (typeof affiliations)[number];
export type Country = (typeof countries)[number];
export type School = (typeof schools)[number];
export type DietRestrictions = (typeof dietrestrictions)[number];
export type Availability = (typeof availabilities)[number];
export type Statuses = (typeof statuses)[number];

export interface User {
  firstname: string;
  lastname: string;
  email: string;
  telephone: string;
  gender: Gender;
  shirt: Shirt;
  dietrestriction: DietRestrictions;
  status: Statuses;
}

export type Participant = User & {
  _id: Id<"participants">;
  discord: string;
  major: Major;
  age: Age;
  country: Country;
  school: School;
  grade: Grade;
  mlh_marketing: boolean;
  resume?: string;
};

export type Judge = User & {
  _id: Id<"judges">;
  affiliation: Affiliation;
  title: string;
  organization: string;
  picture: string;
};

export type Superadmin = User & {
  _id: Id<"superadmins">;
  discord: string;
  major: Major;
  age: Age;
  grade: Grade;
  team: Team;
};

export type Volunteer = User & {
  _id: Id<"volunteers">;
  availabilities: Availability[];
};

export type SuperUser = Participant | Judge | Superadmin | Volunteer;
