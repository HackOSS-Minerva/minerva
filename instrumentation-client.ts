import posthog from "posthog-js";
import { POSTHOG_HOST } from "./lib/posthog";

posthog.init(process.env.NEXT_PUBLIC_POSTHOG_KEY!, {
  api_host: "/ingest",
  ui_host: POSTHOG_HOST,
  defaults: "2025-05-24",
  capture_exceptions: true,
  debug: process.env.NODE_ENV === "development",
});
