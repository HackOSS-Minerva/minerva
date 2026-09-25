"use client";

import { useParams } from "next/navigation";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import * as participant from "@/components/forms/fields/participant";
import * as judge from "@/components/forms/fields/judge";
import * as speaker from "@/components/forms/fields/speaker";
import * as superadmin from "@/components/forms/fields/superadmin";
import * as volunteer from "@/components/forms/fields/volunteer";
import { captureAnalyticsEvent } from "@/lib/posthog";
import { useEmail } from "./use-email";
import { getTenant } from "./get-tenant";
import { uploadFile } from "../lib/storage";
import { AppError, logAppError } from "@/lib/app-error";
import { toastAppError } from "@/hooks/use-app-error";
import type { EmailRecipient, EmailRole } from "@/types/email";
import type { TenantSlug } from "./get-tenant";
import { z } from "zod";

export type slugs =
  | "participant"
  | "judge"
  | "speaker"
  | "superadmin"
  | "volunteer";

const FIELDS = {
  participant,
  judge,
  speaker,
  superadmin,
  volunteer,
} as const;

/** Validated form values for each registration form, keyed by route slug. */
type FormValuesMap = {
  [S in slugs]: z.infer<(typeof FIELDS)[S]["schema"]>;
};

/**
 * Union of validated values across the five registration forms. The form
 * validates `value` against its slug's zod schema before submit, so each
 * switch branch below narrows to that schema's value type.
 */
export type FormValues = FormValuesMap[slugs];

const MUTATIONS = {
  participant: api.participants.add,
  judge: api.judges.add,
  speaker: api.speakers.add,
  superadmin: api.superadmins.add,
  volunteer: api.volunteers.add,
} as const;

export const useFields = () => {
  const { form, tenant } = useParams<{ form: slugs; tenant: TenantSlug }>();
  const slug = form;

  const { headers } = getTenant(tenant);

  const add = useMutation(MUTATIONS[slug]);
  const { sendEmail } = useEmail();

  const sendConfirmationEmail = async (
    role: EmailRole,
    user: EmailRecipient,
    id: string,
  ) => {
    try {
      await sendEmail({
        role,
        type: "CONFIRMATION",
        user,
        idempotencyKey: `${id}:CONFIRMATION`,
      });
    } catch (error) {
      logAppError({
        route: "registration-confirmation-email",
        error,
        requestId: "client",
      });
      toastAppError(
        error,
        "Registration submitted, but the confirmation email could not be sent.",
      );
    }
  };

  const onSubmit = async (value: FormValues) => {
    const email = value.email;
    const firstname = value.firstname;
    const lastname = value.lastname;
    switch (slug) {
      case "volunteer": {
        // The form validated `value` against this slug's schema before submit;
        // narrow the union to this branch's value type.
        const v = value as FormValuesMap["volunteer"];
        const result = await add({
          tenant,
          user: {
            firstname: firstname,
            lastname: lastname,
            email: email,
            telephone: v.telephone,
            gender: v.gender,
            shirt: v.shirt,
            discord: v.discord,
            terms: Boolean(v.terms),
            dietrestriction: v.dietrestriction,
            availabilities: v.availabilities,
          },
        });

        captureAnalyticsEvent("application_created", {
          tenant,
          entity_id: String(result.id),
          role: "volunteer",
          status: "PENDING",
        });

        if (result.user) {
          await sendConfirmationEmail(
            "volunteer",
            result.user,
            String(result.id),
          );
        }

        return result;
      }

      case "participant": {
        const v = value as FormValuesMap["participant"];
        let url = "";
        if (v.resume) {
          const file = v.resume;
          url = await uploadFile(
            `${tenant}/participants/resumes/${crypto.randomUUID ? crypto.randomUUID() : Date.now()}.pdf`,
            file,
          );
        }

        const result = await add({
          tenant,
          user: {
            firstname: firstname,
            lastname: lastname,
            email: email,
            telephone: v.telephone,
            gender: v.gender,
            shirt: v.shirt,
            discord: v.discord,
            major: v.major,
            age: v.age,
            country: v.country,
            school: v.school,
            grade: v.grade,
            // The form schema names this consent field `mlh`; `mlh_marketing`
            // has never existed on the value, so this stays `false` as before.
            mlh_marketing: Boolean(
              (value as { mlh_marketing?: unknown }).mlh_marketing,
            ),
            dietrestriction: v.dietrestriction,
            resume: url || undefined,
          },
        });

        captureAnalyticsEvent("application_created", {
          tenant,
          entity_id: String(result.id),
          role: "participant",
          status: "PENDING",
          gender: v.gender,
          dietrestriction: v.dietrestriction,
          shirt: v.shirt,
          school: v.school,
          major: v.major,
          age: v.age,
          grade: v.grade,
        });

        if (result.user) {
          await sendConfirmationEmail(
            "participant",
            result.user,
            String(result.id),
          );
        }

        return result;
      }

      case "judge": {
        const v = value as FormValuesMap["judge"];
        let url = "";
        const file = v.picture;
        url = await uploadFile(
          `${tenant}/judges/pictures/${crypto.randomUUID ? crypto.randomUUID() : Date.now()}`,
          file,
        );

        const result = await add({
          tenant,
          user: {
            firstname: firstname,
            lastname: lastname,
            email: email,
            telephone: v.telephone,
            gender: v.gender,
            shirt: v.shirt,
            affiliation: v.affiliation,
            title: v.title,
            organization: v.organization,
            dietrestriction: v.dietrestriction,
            picture: url,
          },
        });

        captureAnalyticsEvent("application_created", {
          tenant,
          entity_id: String(result.id),
          role: "judge",
          status: "PENDING",
        });

        if (result.user) {
          await sendConfirmationEmail("judge", result.user, String(result.id));
        }

        return result;
      }

      case "speaker": {
        const v = value as FormValuesMap["speaker"];
        let url = "";
        const file = v.picture;
        url = await uploadFile(
          `${tenant}/speakers/pictures/${crypto.randomUUID ? crypto.randomUUID() : Date.now()}`,
          file,
        );

        const result = await add({
          tenant,
          user: {
            firstname: firstname,
            lastname: lastname,
            email: email,
            telephone: v.telephone,
            gender: v.gender,
            shirt: v.shirt,
            affiliation: v.affiliation,
            title: v.title,
            organization: v.organization,
            dietrestriction: v.dietrestriction,
            picture: url,
          },
        });

        captureAnalyticsEvent("application_created", {
          tenant,
          entity_id: String(result.id),
          role: "speaker",
          status: "PENDING",
        });

        if (result.user) {
          await sendConfirmationEmail(
            "speaker",
            result.user,
            String(result.id),
          );
        }

        return result;
      }

      case "superadmin": {
        const v = value as FormValuesMap["superadmin"];
        const result = await add({
          tenant,
          user: {
            firstname: firstname,
            lastname: lastname,
            email: email,
            telephone: v.telephone,
            gender: v.gender,
            shirt: v.shirt,
            discord: v.discord,
            major: v.major,
            age: v.age,
            grade: v.grade,
            team: v.team,
            dietrestriction: v.dietrestriction,
          },
        });

        captureAnalyticsEvent("application_created", {
          tenant,
          entity_id: String(result.id),
          role: "superadmin",
          status: "PENDING",
        });

        if (result.user) {
          await sendConfirmationEmail(
            "superadmin",
            result.user,
            String(result.id),
          );
        }

        return result;
      }

      default:
        throw new AppError("VALIDATION_FAILED", {
          details: `Unsupported form: ${slug}`,
        });
    }
  };

  return {
    metadata: { Header: headers[slug] },
    form: FIELDS[slug],
    onSubmit,
  } as const;
};
