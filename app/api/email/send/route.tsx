import React from "react";
import { render } from "@react-email/render";
import { Resend } from "resend";
import { z } from "zod";
import Email, { getEmailSubject } from "@/components/email";

const payloadSchema = z.object({
  type: z.enum(["CONFIRMATION", "ACCEPTANCE", "REJECTION"]),
  role: z.enum(["judge", "participant", "speaker", "superadmin", "volunteer"]),
  tenant: z.literal("designverse"),
  user: z.object({
    firstname: z.string().trim().min(1).max(100),
    lastname: z.string().trim().min(1).max(100),
    email: z.email(),
  }),
  idempotencyKey: z.string().min(1).max(200),
});

export async function POST(request: Request) {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    return Response.json(
      { error: "Email delivery is not configured" },
      { status: 503 },
    );
  }

  let body: unknown;

  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "Invalid JSON payload" }, { status: 400 });
  }

  const parsed = payloadSchema.safeParse(body);
  if (!parsed.success) {
    return Response.json({ error: "Invalid email payload" }, { status: 400 });
  }

  const { type, role, tenant, user, idempotencyKey } = parsed.data;
  const name = `${user.firstname} ${user.lastname}`.trim();

  try {
    const html = await render(React.createElement(Email, { type, role, name }));
    const resend = new Resend(apiKey);
    const { data, error } = await resend.emails.send(
      {
        from: process.env.EMAIL_FROM ?? "DesignVerse <onboarding@resend.dev>",
        to: [user.email],
        subject: getEmailSubject(type),
        html,
      },
      { idempotencyKey: `${tenant}:${idempotencyKey}` },
    );

    if (error) {
      console.error("[email-api] Resend error", { type, role, tenant, error });
      return Response.json({ error: error.message }, { status: 502 });
    }

    return Response.json({ id: data.id });
  } catch (error) {
    console.error("[email-api] Failed to send email", {
      type,
      role,
      tenant,
      error,
    });
    return Response.json({ error: "Failed to send email" }, { status: 500 });
  }
}
