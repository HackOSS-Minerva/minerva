import "server-only";
import { z } from "zod";
import { roles } from "@/data/information";
import { statuses } from "@/data/status";
import { isTenantSlug } from "@/hooks/get-tenant";

export const analyticsRoleSchema = z.enum(roles);
const applicationStatusSchema = z.enum(statuses);
const text = z.string().min(1).max(512);
export const captureSchema = z
  .object({
    event: z.enum([
      "application_created",
      "application_status_changed",
      "application_deleted",
      "checkin_created",
      "checkin_deleted",
      "submission_created",
      "submission_deleted",
    ]),
    properties: z
      .object({
        tenant: z.string().refine(isTenantSlug),
        entity_id: text,
        role: analyticsRoleSchema.optional(),
        status: applicationStatusSchema.optional(),
        user_id: text.optional(),
        event_id: text.optional(),
        gender: text.optional(),
        dietrestriction: text.optional(),
        shirt: text.optional(),
        school: text.optional(),
        major: text.optional(),
        age: text.optional(),
        grade: text.optional(),
      })
      .strict(),
  })
  .strict()
  .refine(({ event, properties }) => {
    if (event.startsWith("application_") && !properties.role) return false;
    if (event === "application_created" && properties.status !== "PENDING") return false;
    if (event === "application_status_changed" && !properties.status) return false;
    if (event === "checkin_created" && (!properties.user_id || !properties.event_id)) return false;
    return true;
  });

export type AnalyticsCapture = z.infer<typeof captureSchema>;
