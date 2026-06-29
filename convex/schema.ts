import { defineSchema, defineTable } from "convex/server";
import { v, Validator } from "convex/values";
import {
  ages as Ages,
  availabilities as Availabilities,
  dietrestrictions as DietRestrictions,
  grades as Grades,
  majors as Majors,
  teams as Teams,
} from "../data/information";
import {
  affiliations as Affiliations,
  genders as Genders,
  shirts as Shirts,
} from "../data/information";
import { countries as Countries } from "../data/countries";
import { schools as Schools } from "../data/schools";
import { statuses as Statuses } from "../data/status";

export const union = <const T extends readonly [string, ...string[]]>(
  values: T,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
): Validator<any> => {
  return v.union(...values.map((value) => v.literal(value)));
};

export const genders = union(Genders);
export const shirts = union(Shirts);
export const affiliations = union(Affiliations);
export const statuses = union(Statuses);
export const grades = union(Grades);
export const majors = union(Majors);
export const teams = union(Teams);
export const countries = union(Countries);
export const schools = union(Schools);
export const ages = union(Ages);
export const dietrestrictions = union(DietRestrictions);
export const availabilities = union(Availabilities);

export default defineSchema({
  participants: defineTable({
    firstname: v.string(),
    lastname: v.string(),
    email: v.string(),
    telephone: v.string(),
    gender: genders,
    shirt: shirts,
    discord: v.string(),
    major: majors,
    age: ages,
    country: countries,
    school: schools,
    grade: grades,
    mlh_marketing: v.boolean(),
    dietrestriction: dietrestrictions,
    resume: v.optional(v.string()),
    status: statuses,
    tenant: v.string(),
    workos: v.string(),
  }),

  judges: defineTable({
    firstname: v.string(),
    lastname: v.string(),
    email: v.string(),
    telephone: v.string(),
    gender: genders,
    shirt: shirts,
    affiliation: affiliations,
    title: v.string(),
    organization: v.string(),
    dietrestriction: dietrestrictions,
    picture: v.string(),
    status: statuses,
    tenant: v.string(),
    workos: v.string(),
  }),

  speakers: defineTable({
    firstname: v.string(),
    lastname: v.string(),
    email: v.string(),
    telephone: v.string(),
    gender: genders,
    shirt: shirts,
    affiliation: affiliations,
    title: v.string(),
    organization: v.string(),
    dietrestriction: dietrestrictions,
    picture: v.string(),
    status: statuses,
    tenant: v.string(),
    workos: v.string(),
  }),

  superadmins: defineTable({
    firstname: v.string(),
    lastname: v.string(),
    email: v.string(),
    telephone: v.string(),
    gender: genders,
    shirt: shirts,
    discord: v.string(),
    major: majors,
    age: ages,
    grade: grades,
    team: teams,
    status: statuses,
    dietrestriction: dietrestrictions,
    authId: v.string(),
    tenant: v.string(),
    workos: v.string(),
  }),

  checkins: defineTable({
    userid: v.string(),
    eventid: v.string(),
    firstname: v.string(),
    lastname: v.string(),
    email: v.string(),
    role: v.string(),
    timestamp: v.number(),
    tenant: v.string(),
  })
    .index("by_user_event", ["userid", "eventid"])
    .index("by_event_tenant", ["eventid", "tenant"]),

  volunteers: defineTable({
    firstname: v.string(),
    lastname: v.string(),
    email: v.string(),
    telephone: v.string(),
    discord: v.string(),
    gender: genders,
    shirt: shirts,
    terms: v.boolean(),
    dietrestriction: dietrestrictions,
    availabilities: v.array(availabilities),
    status: statuses,
    tenant: v.string(),
    workos: v.string(),
  }),

  feedback: defineTable({
    find: v.string(),
    liked_to_see: v.string(),
    not_beneficial: v.string(),
    rating: v.number(),
    anything_else: v.string(),
    tenant: v.string(),
    timestamp: v.number(),
  }),

  ideas: defineTable({
    title: v.string(),
    description: v.string(),
    authorid: v.string(),
    author: v.string(),
    skills: v.array(v.string()),
    timestamp: v.number(),
    tenant: v.string(),
  }),

  submissions: defineTable({
    teamName: v.string(),
    projectName: v.string(),
    description: v.string(),
    devpost: v.string(),
    github: v.array(v.string()),
    figma: v.array(v.string()),
    canva: v.array(v.string()),
    presentation: v.optional(v.string()),
    invites: v.array(v.string()),
    tenant: v.string(),
    workos: v.string(),
    timestamp: v.number(),
  })
    .index("by_tenant_workos", ["tenant", "workos"]),
});
