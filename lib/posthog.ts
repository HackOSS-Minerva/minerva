import { type EmailPayload } from "@/types/email";
import posthog from "posthog-js";

type Role = "judge" | "participant" | "speaker" | "superadmin" | "volunteer";

type PosthogUser = {
  email: string;
  firstname: string;
  lastname: string;
  gender: string;
  shirt: string;
};

const getPayload = (role: Role, user: PosthogUser, tenant: string) => {
  return {
    role: role,
    email: user.email,
    username: `${user.firstname} ${user.lastname}`,
    shirt: user.shirt,
    gender: user.gender,
    tenant: tenant,
  };
};

export const pending = (role: Role, user: PosthogUser, tenant: string) => {
  posthog.capture("user_pending", getPayload(role, user, tenant));
};

export const accepted = (role: Role, user: PosthogUser, tenant: string) => {
  posthog.capture("user_accepted", getPayload(role, user, tenant));
};

export const rejected = (role: Role, user: PosthogUser, tenant: string) => {
  posthog.capture("user_rejected", getPayload(role, user, tenant));
};

export const deleted = (role: Role, user: PosthogUser, tenant: string) => {
  posthog.capture("user_deleted", getPayload(role, user, tenant));
};

export const email = (email: string, payload: EmailPayload, tenant: string) => {
  posthog.capture("email", {
    role: payload.position,
    name: payload.name,
    email: email,
    type: payload.type,
    tenant: tenant,
  });
};
