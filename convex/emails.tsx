"use node";

import React from "react";
import { render } from "@react-email/render";
import { Resend } from "resend";
import { v } from "convex/values";
import { internalAction } from "./_generated/server";
import Email, { getEmailSubject } from "../components/email";
import type { EmailRole, EmailType } from "../types/email";

const emailTypes = ["CONFIRMATION", "ACCEPTANCE", "REJECTION"] as const;
const emailRoles = [
  "judge",
  "participant",
  "speaker",
  "superadmin",
  "volunteer",
] as const;

export const send = internalAction({
  args: {
    type: v.union(...emailTypes.map((type) => v.literal(type))),
    role: v.union(...emailRoles.map((role) => v.literal(role))),
    tenant: v.string(),
    user: v.object({
      firstname: v.string(),
      lastname: v.string(),
      email: v.string(),
    }),
    idempotencyKey: v.string(),
  },
  handler: async (_ctx, { type, role, tenant, user, idempotencyKey }) => {
    const apiKey = process.env.RESEND_API_KEY;
    if (!apiKey) {
      throw new Error("RESEND_API_KEY is not configured for Convex");
    }

    const from =
      process.env.EMAIL_FROM ?? "DesignVerse <onboarding@resend.dev>";

    const resend = new Resend(apiKey);
    const name = `${user.firstname} ${user.lastname}`.trim();
    const html = await render(
      React.createElement(Email, {
        type: type as EmailType,
        role: role as EmailRole,
        name,
      }),
    );

    const { data, error } = await resend.emails.send(
      {
        from,
        to: [user.email],
        subject: getEmailSubject(type as EmailType),
        html,
      },
      { idempotencyKey: `${tenant}:${idempotencyKey}` },
    );

    if (error) {
      console.error("[email] Resend error", {
        type,
        role,
        tenant,
        error,
      });
      throw new Error(error.message);
    }

    console.info("[email] Resend email sent", {
      type,
      role,
      tenant,
      emailId: data?.id,
    });

    return { id: data?.id };
  },
});
