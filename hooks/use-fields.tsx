"use client";

import { useParams } from "next/navigation";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import * as participant from "@/components/forms/fields/participant";
import * as judge from "@/components/forms/fields/judge";
import * as speaker from "@/components/forms/fields/speaker";
import * as superadmin from "@/components/forms/fields/superadmin";
import * as volunteer from "@/components/forms/fields/volunteer";
import { trackApplicationStarted, trackApplicationSubmitted } from "@/lib/posthog";
// import { useSendEmail } from "./use-send-email";
import { useTenant } from "./use-tenant";
import { uploadFile } from "../lib/storage";
import { useRef } from "react";

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
  const hasStarted = useRef(false);
  // const sendEmail = useSendEmail();

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

        trackApplicationSubmitted({ tenant, role: "volunteer", form: "volunteer" });

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

        const result = await add(
          {
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
          },
        );

        trackApplicationSubmitted({ tenant, role: "participant", form: "participant" });

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

        trackApplicationSubmitted({ tenant, role: "judge", form: "judge" });

        return result;
      }

      case "speaker": {
        let url = "";
        const file = value.picture as File;
        url = await uploadFile(`${tenant}/speakers/pictures/${crypto.randomUUID ? crypto.randomUUID() : Date.now()}`, file);

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

        trackApplicationSubmitted({ tenant, role: "speaker", form: "speaker" });

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

        trackApplicationSubmitted({ tenant, role: "superadmin", form: "superadmin" });

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
    onFirstInteraction: () => {
      if (hasStarted.current) return;
      hasStarted.current = true;
      trackApplicationStarted({ tenant: name.toLocaleLowerCase(), role: slug, form: slug });
    },
  } as const;
};
