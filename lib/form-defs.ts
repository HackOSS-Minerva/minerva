/** Server-safe form registry (no React, no Convex hooks). Imported by both
 * server shells (`Wrapper`) and the client `useFields()` island. */

import * as participant from "@/components/forms/fields/participant";
import * as judge from "@/components/forms/fields/judge";
import * as speaker from "@/components/forms/fields/speaker";
import * as superadmin from "@/components/forms/fields/superadmin";
import * as volunteer from "@/components/forms/fields/volunteer";
import { getTenant, type TenantSlug } from "@/hooks/get-tenant";
import { api } from "@/convex/_generated/api";
import type { z } from "zod";

export type slugs =
  | "participant"
  | "judge"
  | "speaker"
  | "superadmin"
  | "volunteer";

export const FIELDS = {
  participant,
  judge,
  speaker,
  superadmin,
  volunteer,
} as const;

/** Validated form values for each registration form, keyed by route slug. */
export type FormValuesMap = {
  [S in slugs]: z.infer<(typeof FIELDS)[S]["schema"]>;
};

/** Union of validated values across the registration forms; each switch branch
 * narrows to its slug's zod schema. */
export type FormValues = FormValuesMap[slugs];

export const FORM_MUTATIONS = {
  participant: api.participants.add,
  judge: api.judges.add,
  speaker: api.speakers.add,
  superadmin: api.superadmins.add,
  volunteer: api.volunteers.add,
} as const;

export function isFormSlug(slug: string): slug is slugs {
  return slug in FIELDS;
}

/** Pure server-safe lookup: form def + header for a slug. */
export function getFormDef(slug: slugs, tenant: TenantSlug) {
  const { headers } = getTenant(tenant);
  return {
    metadata: { Header: headers[slug], id: FIELDS[slug].metadata.id },
    form: FIELDS[slug],
  } as const;
}
