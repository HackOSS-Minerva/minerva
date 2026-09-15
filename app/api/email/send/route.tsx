import React from "react";
import { render } from "@react-email/components";
import { Resend } from "resend";
import { z } from "zod";
import Email, { getEmailSubject } from "@/components/email";
import { getTenant, tenantSlugs } from "@/hooks/get-tenant";
import { fetchAuthQuery } from "@/lib/auth-server";
import { AppError, withFetchHandler } from "@/lib/app-error";
import { api } from "@/convex/_generated/api";

const payloadSchema = z.object({
  type: z.enum(["CONFIRMATION", "ACCEPTANCE", "REJECTION"]),
  role: z.enum(["judge", "participant", "speaker", "superadmin", "volunteer"]),
  tenant: z.enum(tenantSlugs),
  user: z.object({
    firstname: z.string().trim().min(1).max(100),
    lastname: z.string().trim().min(1).max(100),
    email: z.email(),
  }),
  idempotencyKey: z.string().min(1).max(200),
});

export const POST = withFetchHandler("email-send", async (request) => {
  const { authenticated } = await fetchAuthQuery(api.auth.getAuthStatus, {});
  if (!authenticated) {
    throw new AppError("UNAUTHORIZED");
  }

  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    throw new AppError("EMAIL_CONFIG_ERROR");
  }

  let body: unknown;

  try {
    body = await request.json();
  } catch {
    throw new AppError("BAD_REQUEST");
  }

  const parsed = payloadSchema.safeParse(body);
  if (!parsed.success) {
    throw new AppError("VALIDATION_FAILED", {
      details: parsed.error.flatten(),
    });
  }

  const { type, role, tenant, user, idempotencyKey } = parsed.data;
  const { config: tenantConfig } = getTenant(tenant);
  if (!tenantConfig) {
    throw new AppError("TENANT_INVALID");
  }

  const name = `${user.firstname} ${user.lastname}`.trim();

  try {
    const html = await render(
      React.createElement(Email, { type, role, name, tenant: tenantConfig }),
    );
    const resend = new Resend(apiKey);
    const { data, error } = await resend.emails.send(
      {
        from: "Minerva <onboarding@resend.dev>",
        to: [user.email],
        replyTo: tenantConfig.email,
        subject: getEmailSubject(type),
        html,
      },
      { idempotencyKey: `${tenant}:${idempotencyKey}` },
    );

    if (error) {
      throw new AppError("EMAIL_SEND_FAILED", {
        details: { type, role, tenant },
        cause: error,
      });
    }

    return Response.json({ id: data.id });
  } catch (error) {
    if (error instanceof AppError) throw error;
    throw new AppError("EMAIL_SEND_FAILED", {
      details: { type, role, tenant },
      cause: error,
    });
  }
});
