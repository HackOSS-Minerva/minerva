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
import type {
  ages,
  affiliations,
  availabilities,
  countries,
  dietrestrictions,
  genders,
  grades,
  majors,
  schools,
  shirts,
  teams,
} from "@/convex/schema";
import type { Infer } from "convex/values";

type Gender = Infer<typeof genders>;
type Shirt = Infer<typeof shirts>;
type Affiliation = Infer<typeof affiliations>;
type DietRestriction = Infer<typeof dietrestrictions>;
type Availabilities = Infer<typeof availabilities>;
type Major = Infer<typeof majors>;
type Age = Infer<typeof ages>;
type Grade = Infer<typeof grades>;
type Country = Infer<typeof countries>;
type School = Infer<typeof schools>;
type Team = Infer<typeof teams>;

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

  const onSubmit = async (value: Record<string, unknown>) => {
    const email = value.email as string;
    const firstname = value.firstname as string;
    const lastname = value.lastname as string;
    switch (slug) {
      case "volunteer": {
        const result = await add({
          tenant,
          user: {
            firstname: firstname,
            lastname: lastname,
            email: email,
            telephone: value.telephone as string,
            gender: value.gender as Gender,
            shirt: value.shirt as Shirt,
            discord: value.discord as string,
            terms: Boolean(value.terms),
            dietrestriction: value.dietrestriction as DietRestriction,
            availabilities: value.availabilities as Availabilities[],
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
        let url = "";
        if (value.resume) {
          const file = value.resume as File;
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
            telephone: value.telephone as string,
            gender: value.gender as Gender,
            shirt: value.shirt as Shirt,
            discord: value.discord as string,
            major: value.major as Major,
            age: value.age as Age,
            country: value.country as Country,
            school: value.school as School,
            grade: value.grade as Grade,
            mlh_marketing: Boolean(value.mlh_marketing),
            dietrestriction: value.dietrestriction as DietRestriction,
            resume: url || undefined,
          },
        });

        captureAnalyticsEvent("application_created", {
          tenant,
          entity_id: String(result.id),
          role: "participant",
          status: "PENDING",
          gender: value.gender as Gender,
          dietrestriction: value.dietrestriction as DietRestriction,
          shirt: value.shirt as Shirt,
          school: value.school as School,
          major: value.major as Major,
          age: value.age as Age,
          grade: value.grade as Grade,
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
        let url = "";
        const file = value.picture as File;
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
            telephone: value.telephone as string,
            gender: value.gender as Gender,
            shirt: value.shirt as Shirt,
            affiliation: value.affiliation as Affiliation,
            title: value.title as string,
            organization: value.organization as string,
            dietrestriction: value.dietrestriction as DietRestriction,
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
        let url = "";
        const file = value.picture as File;
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
            telephone: value.telephone as string,
            gender: value.gender as Gender,
            shirt: value.shirt as Shirt,
            affiliation: value.affiliation as Affiliation,
            title: value.title as string,
            organization: value.organization as string,
            dietrestriction: value.dietrestriction as DietRestriction,
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
        const result = await add({
          tenant,
          user: {
            firstname: firstname,
            lastname: lastname,
            email: email,
            telephone: value.telephone as string,
            gender: value.gender as Gender,
            shirt: value.shirt as Shirt,
            discord: value.discord as string,
            major: value.major as Major,
            age: value.age as Age,
            grade: value.grade as Grade,
            team: value.team as Team,
            dietrestriction: value.dietrestriction as DietRestriction,
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
