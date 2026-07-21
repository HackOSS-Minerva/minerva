"use client";

import { useParams } from "next/navigation";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import * as participant from "@/components/forms/fields/participant";
import * as judge from "@/components/forms/fields/judge";
import * as speaker from "@/components/forms/fields/speaker";
import * as superadmin from "@/components/forms/fields/superadmin";
import * as volunteer from "@/components/forms/fields/volunteer";
import * as Posthog from "@/lib/posthog";
import { useEmail } from "./use-email";
import { useTenant } from "./use-tenant";
import { uploadFile } from "../lib/storage";
import { toast } from "sonner";
import type { EmailRecipient, EmailRole } from "@/types/email";

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
  const { form } = useParams<{ form: slugs }>();
  const slug = form;

  const {
    headers,
    tenant: { name },
  } = useTenant();

  const add = useMutation(MUTATIONS[slug]);
  const { sendEmail } = useEmail();

  const sendConfirmationEmail = async (
    role: EmailRole,
    user: EmailRecipient,
    id: string,
    tenant: string,
  ) => {
    try {
      await sendEmail({
        role,
        type: "CONFIRMATION",
        user,
        tenant,
        idempotencyKey: `${id}:CONFIRMATION`,
      });

      Posthog.email(
        user.email,
        {
          name: `${user.firstname} ${user.lastname}`,
          position: role,
          type: "CONFIRMATION",
          preview: "Thank you for applying.",
        },
        tenant,
      );
    } catch (error) {
      console.error("Failed to send registration confirmation", {
        role,
        tenant,
        error,
      });
      toast.warning(
        "Registration submitted, but the confirmation email could not be sent.",
      );
    }
  };

  const onSubmit = async (value: Record<string, unknown>) => {
    const email = value.email as string;
    const firstname = value.firstname as string;
    const lastname = value.lastname as string;
    const tenant = name.toLocaleLowerCase();

    switch (slug) {
      case "volunteer": {
        const result = await add({
          tenant,
          user: {
            firstname: firstname,
            lastname: lastname,
            email: email,
            telephone: value.telephone as string,
            gender: value.gender as string,
            shirt: value.shirt as string,
            discord: value.discord as string,
            terms: Boolean(value.terms),
            dietrestriction: value.dietrestriction as string,
            availabilities: value.availabilities as string[],
          },
        });

        if (result.user) {
          Posthog.pending("volunteer", result.user, tenant);
          await sendConfirmationEmail(
            "volunteer",
            result.user,
            String(result.id),
            tenant,
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
            gender: value.gender as string,
            shirt: value.shirt as string,
            discord: value.discord as string,
            major: value.major as string,
            age: value.age as string,
            country: value.country as string,
            school: value.school as string,
            grade: value.grade as string,
            mlh_marketing: Boolean(value.mlh_marketing),
            dietrestriction: value.dietrestriction as string,
            resume: url || undefined,
          },
        });

        if (result.user) {
          Posthog.pending("participant", result.user, tenant);
          await sendConfirmationEmail(
            "participant",
            result.user,
            String(result.id),
            tenant,
          );
        }

        return result;
      }

      case "judge": {
        const result = await add({
          tenant,
          user: {
            firstname: firstname,
            lastname: lastname,
            email: email,
            telephone: value.telephone as string,
            gender: value.gender as string,
            shirt: value.shirt as string,
            affiliation: value.affiliation as string,
            title: value.title as string,
            organization: value.organization as string,
            dietrestriction: value.dietrestriction as string,
            picture: value.picture as string,
          },
        });

        if (result.user) {
          Posthog.pending("judge", result.user, tenant);
          await sendConfirmationEmail(
            "judge",
            result.user,
            String(result.id),
            tenant,
          );
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
            gender: value.gender as string,
            shirt: value.shirt as string,
            affiliation: value.affiliation as string,
            title: value.title as string,
            organization: value.organization as string,
            dietrestriction: value.dietrestriction as string,
            picture: url,
          },
        });

        if (result.user) {
          Posthog.pending("speaker", result.user, tenant);
          await sendConfirmationEmail(
            "speaker",
            result.user,
            String(result.id),
            tenant,
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
            gender: value.gender as string,
            shirt: value.shirt as string,
            discord: value.discord as string,
            major: value.major as string,
            age: value.age as string,
            grade: value.grade as string,
            team: value.team as string,
            dietrestriction: value.dietrestriction as string,
          },
        });

        if (result.user) {
          Posthog.pending("superadmin", result.user, tenant);
          await sendConfirmationEmail(
            "superadmin",
            result.user,
            String(result.id),
            tenant,
          );
        }

        return result;
      }

      default:
        throw new Error(`Unsupported form: ${slug}`);
    }
  };

  return {
    metadata: { Header: headers[slug] },
    form: FIELDS[slug],
    onSubmit,
  } as const;
};
