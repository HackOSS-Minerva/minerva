"use client";

import { useParams } from "next/navigation";
import { useMutation } from "convex/react";
import {
  FORM_MUTATIONS,
  getFormDef,
  type FormValues,
  type FormValuesMap,
  type slugs,
} from "@/lib/form-defs";
import { captureAnalyticsEvent } from "@/lib/posthog";
import { useEmail } from "./use-email";
import { uploadFile } from "../lib/storage";
import { AppError, logAppError } from "@/lib/app-error";
import { toastAppError } from "@/hooks/use-app-error";
import type { EmailRecipient, EmailRole } from "@/types/email";
import type { TenantSlug } from "./get-tenant";

export type { slugs, FormValues, FormValuesMap } from "@/lib/form-defs";

export const useFields = () => {
  const { form, tenant } = useParams<{ form: slugs; tenant: TenantSlug }>();
  const slug = form;

  const { metadata, form: formDef } = getFormDef(slug, tenant);

  const add = useMutation(FORM_MUTATIONS[slug]);
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
    metadata,
    form: formDef,
    onSubmit,
  } as const;
};
