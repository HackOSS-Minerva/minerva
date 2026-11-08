import { chromium, expect, type BrowserContext, type Page } from "@playwright/test";
import { execFile } from "node:child_process";
import { promisify } from "node:util";
import { createHmac, randomUUID } from "node:crypto";
import { mkdir, mkdtemp, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { resolve } from "node:path";

// Use Node 24+ for native TypeScript and Playwright's browser lifecycle support.
// All mutations use the configured DEVELOPMENT deployment and synthetic users.
if (!process.env.CONVEX_DEPLOYMENT?.startsWith("dev:")) {
  throw new Error("E2E fixtures require CONVEX_DEPLOYMENT=dev:…; production is forbidden.");
}
const deployment = process.env.CONVEX_DEPLOYMENT.slice(4).split("|")[0].trim();
if (process.env.NEXT_PUBLIC_CONVEX_URL !== `https://${deployment}.convex.cloud`) {
  throw new Error("The browser and CLI must target the same development deployment.");
}
const baseURL = process.env.E2E_BASE_URL ?? "http://localhost:3000";
if (!["localhost", "127.0.0.1"].includes(new URL(baseURL).hostname)) {
  throw new Error("E2E requires a local Next.js server.");
}

const exec = promisify(execFile);
const runId = `hack-credits-${Date.now()}-${randomUUID().slice(0, 8)}`;
const output = resolve("test-results", runId);
const temporary = await mkdtemp(resolve(tmpdir(), "minerva-credits-"));
await mkdir(output, { recursive: true });
const evidence: { name: string; result: unknown }[] = [];
const cleanupErrors: string[] = [];
type Identity = { subject: string; sessionId: string };
type TestUser = { id: string; email: string; token: string; identity: Identity };
const users: TestUser[] = [];
const contexts: BrowserContext[] = [];
const roleIds: { table: "participants" | "superadmins"; id: string }[] = [];
const attendance = new Map<string, "cutiehack" | "rosehack">();
let browser: Awaited<ReturnType<typeof chromium.launch>> | undefined;

async function cli(args: string[]) {
  const { stdout } = await exec(
    process.execPath,
    [resolve("node_modules/convex/bin/main.js"), ...args],
    {
      maxBuffer: 4 * 1024 * 1024,
      timeout: 90_000,
      env: { ...process.env, NO_COLOR: "1" },
    },
  );
  return stdout.trim();
}
async function call(name: string, args: unknown, identity?: Identity, component?: string) {
  const flags = identity ? ["--identity", JSON.stringify(identity)] : [];
  if (component) flags.push("--component", component);
  const output = await cli(["run", name, JSON.stringify(args), ...flags]);
  return output ? JSON.parse(output) : null;
}
async function denied(name: string, args: unknown, identity: Identity | undefined, code: string) {
  try {
    await call(name, args, identity);
  } catch (error) {
    expect(String(error), `${name} should reject with ${code}`).toContain(code);
    return;
  }
  throw new Error(`${name} unexpectedly succeeded`);
}
function record(name: string, result: unknown = "passed") {
  evidence.push({ name, result });
  console.log(`PASS ${name}`);
}
async function createUser(label: string) {
  const now = Date.now();
  const email = `${runId}-${label}@example.invalid`;
  const doc = await call(
    "adapter:create",
    {
      input: {
        model: "user",
        data: {
          name: `Credits E2E ${label}`,
          email,
          emailVerified: true,
          createdAt: now,
          updatedAt: now,
        },
      },
    },
    undefined,
    "betterAuth",
  );
  const user: TestUser = {
    id: doc._id,
    email,
    token: randomUUID(),
    identity: { subject: doc._id, sessionId: "" },
  };
  users.push(user);
  const session = await call(
    "adapter:create",
    {
      input: {
        model: "session",
        data: {
          userId: user.id,
          token: user.token,
          expiresAt: now + 3_600_000,
          createdAt: now,
          updatedAt: now,
        },
      },
    },
    undefined,
    "betterAuth",
  );
  user.identity.sessionId = session._id;
  return user;
}
async function append(table: string, rows: unknown[]) {
  const file = resolve(temporary, `${table}.json`);
  await writeFile(file, JSON.stringify(rows));
  await cli(["import", "--append", "--table", table, file]);
}
const profile = {
  firstname: "Credits",
  lastname: "E2E",
  telephone: "0000000000",
  gender: "Other",
  shirt: "M",
  discord: "credits-e2e",
  major: "Computer Science",
  age: "18",
  grade: "Undergraduate",
  dietrestriction: "None",
};
async function addRole(
  table: "participants" | "superadmins",
  user: TestUser,
  tenant: "cutiehack" | "rosehack",
  status = "ACCEPTANCE",
) {
  const specific =
    table === "superadmins"
      ? { team: "Software" }
      : {
          country: "United States of America",
          school: "University of California, Riverside",
          mlh_marketing: false,
        };
  const { id } = await call(
    `${table}:add`,
    {
      tenant,
      user: { ...profile, ...specific, email: user.email },
    },
    user.identity,
  );
  roleIds.push({ table, id });
  if (status !== "PENDING") await call(`${table}:setStatusMany`, { ids: [id], status });
}
function args(user: TestUser, eventid: string, tenant = "cutiehack") {
  return {
    userid: user.id,
    eventid,
    tenant,
    firstname: "Credits",
    lastname: "E2E",
    email: user.email,
  };
}
async function checkin(
  user: TestUser,
  eventid: string,
  tenant: "cutiehack" | "rosehack",
  admin: TestUser,
) {
  const result = await call("checkins:checkin", args(user, eventid, tenant), admin.identity);
  attendance.set(result.id, tenant);
  return result.id as string;
}
async function balance(user: TestUser, tenant: string, expected: number) {
  const result = await call("checkins:getHackCredits", { tenant }, user.identity);
  expect(result).toEqual({ balance: expected, checkinCount: expected / 10 });
  return result;
}
async function openAs(user: TestUser | null, secret: string) {
  const context = await browser!.newContext({ viewport: { width: 1280, height: 960 } });
  contexts.push(context);
  await context.tracing.start({ screenshots: true, snapshots: true, sources: true });
  if (user) {
    const signature = createHmac("sha256", secret).update(user.token).digest("base64");
    const value = encodeURIComponent(`${user.token}.${signature}`);
    await context.addCookies([
      { name: "better-auth.session_token", value, url: baseURL, httpOnly: true, sameSite: "Lax" },
      {
        name: "__Secure-better-auth.session_token",
        value,
        domain: new URL(baseURL).hostname,
        path: "/",
        httpOnly: true,
        secure: true,
        sameSite: "Lax",
      },
    ]);
  }
  return context.newPage();
}
async function visibleBalance(page: Page, expected: number, screenshot?: string) {
  await expect(page.getByTestId("hack-credits-balance")).toHaveText(`${expected} credits`, {
    timeout: 30_000,
  });
  if (screenshot)
    await page.screenshot({ path: resolve(output, `${screenshot}.png`), fullPage: true });
}

try {
  const secret = await cli(["env", "get", "BETTER_AUTH_SECRET"]);
  if (!secret)
    throw new Error("The dev deployment needs BETTER_AUTH_SECRET to create test sessions.");
  const attendee = await createUser("attendee");
  const other = await createUser("other");
  const cutieAdmin = await createUser("cutie-admin");
  const roseAdmin = await createUser("rose-admin");
  await addRole("superadmins", cutieAdmin, "cutiehack");
  await addRole("superadmins", roseAdmin, "rosehack");
  await addRole("superadmins", other, "cutiehack", "PENDING");
  await addRole("participants", attendee, "cutiehack");
  await addRole("participants", attendee, "rosehack");

  const legacyEvent = `${runId}-legacy`;
  // Schema-compatible rows without a credit field model pre-feature attendance.
  const legacy = (user: TestUser) => ({
    ...args(user, legacyEvent),
    role: "VISITOR",
    timestamp: Date.now() - 86_400_000,
  });
  await append("checkins", [legacy(attendee), legacy(attendee), legacy(other)]);
  const rows = await call(
    "checkins:getByEvent",
    { tenant: "cutiehack", eventid: legacyEvent },
    cutieAdmin.identity,
  );
  for (const row of rows) attendance.set(row._id, "cutiehack");

  await balance(attendee, "cutiehack", 10);
  await balance(attendee, "rosehack", 0);
  await balance(other, "cutiehack", 10);
  expect(await call("checkins:getHackCredits", { tenant: "cutiehack" })).toBeNull();
  record("historical attendance, legacy duplicates, user isolation, and signed-out query");

  const activity = `${runId}-activity`;
  await denied("checkins:checkin", args(attendee, activity), undefined, "UNAUTHORIZED");
  await denied("checkins:checkin", args(attendee, activity), attendee.identity, "FORBIDDEN");
  await denied("checkins:checkin", args(attendee, activity), other.identity, "FORBIDDEN");
  await denied(
    "checkins:checkin",
    args(attendee, activity, "rosehack"),
    cutieAdmin.identity,
    "FORBIDDEN",
  );
  await denied(
    "checkins:checkin",
    { ...args(attendee, activity), userid: "visitor" },
    cutieAdmin.identity,
    "NOT_FOUND",
  );
  await denied("checkins:checkin", args(attendee, " "), cutieAdmin.identity, "BAD_REQUEST");
  await denied(
    "checkins:getHackCredits",
    { tenant: "cutiehack", userid: other.id },
    attendee.identity,
    "ArgumentValidationError",
  );
  record(
    "unauthorized, pending admin, cross-hackathon admin, placeholder, and arbitrary-user requests rejected",
  );

  browser = await chromium.launch();
  const page = await openAs(attendee, secret);
  await page.goto(`${baseURL}/cutiehack/live/checkin`);
  await visibleBalance(page, 10, "01-existing-attendance");
  record("authenticated check-in page shows historical credits", { cutiehack: 10 });

  const scans = await Promise.allSettled([
    checkin(attendee, activity, "cutiehack", cutieAdmin),
    checkin(attendee, activity, "cutiehack", cutieAdmin),
  ]);
  expect(scans.filter((scan) => scan.status === "fulfilled")).toHaveLength(1);
  const rejected = scans.find((scan) => scan.status === "rejected");
  expect(rejected?.status === "rejected" && String(rejected.reason)).toContain("VALIDATION_FAILED");
  await balance(attendee, "cutiehack", 20);
  await visibleBalance(page, 20, "02-live-credit-update");
  record("concurrent duplicate scans award once and the open page updates live", { cutiehack: 20 });

  const second = await checkin(attendee, `${runId}-second`, "cutiehack", cutieAdmin);
  await visibleBalance(page, 30);
  await page.reload();
  await visibleBalance(page, 30);
  await page.goto(`${baseURL}/cutiehack/live/dashboard`);
  await visibleBalance(page, 30, "03-dashboard-balance");
  await page.setViewportSize({ width: 375, height: 812 });
  await visibleBalance(page, 30, "03-dashboard-mobile");
  const cardBounds = await page.getByTestId("hack-credits-card").boundingBox();
  expect(cardBounds).not.toBeNull();
  expect(cardBounds!.x).toBeGreaterThanOrEqual(0);
  expect(cardBounds!.x + cardBounds!.width).toBeLessThanOrEqual(375);
  await page.setViewportSize({ width: 1280, height: 960 });
  record("multiple activities, persistence after reload, and dashboard balance", { cutiehack: 30 });

  const rose = await checkin(attendee, legacyEvent, "rosehack", roseAdmin);
  await page.goto(`${baseURL}/rosehack/live/checkin`);
  await visibleBalance(page, 10, "04-rosehack-isolation");
  await balance(attendee, "cutiehack", 30);
  record("matching activity IDs remain independent between hackathons", {
    cutiehack: 30,
    rosehack: 10,
  });
  const otherPage = await openAs(other, secret);
  await otherPage.goto(`${baseURL}/cutiehack/live/checkin`);
  await visibleBalance(otherPage, 10, "05-other-user");
  const anonymousPage = await openAs(null, secret);
  await anonymousPage.goto(`${baseURL}/cutiehack/live/checkin`);
  await expect(anonymousPage.getByTestId("hack-credits-card")).toContainText(
    "Sign in to view your hack credits.",
  );
  await expect(anonymousPage.getByTestId("hack-credits-balance")).toHaveCount(0);
  record("browser sessions keep users separate and signed-out balance private");

  await denied("checkins:remove", { id: second }, undefined, "UNAUTHORIZED");
  await denied("checkins:remove", { id: second }, attendee.identity, "FORBIDDEN");
  await denied("checkins:remove", { id: rose }, cutieAdmin.identity, "FORBIDDEN");
  await denied("checkins:deleteMany", { ids: [second, rose] }, cutieAdmin.identity, "FORBIDDEN");
  await balance(attendee, "cutiehack", 30);
  await balance(attendee, "rosehack", 10);
  record("deletion requires tenant admin and mixed-tenant bulk deletion is atomic");

  await page.goto(`${baseURL}/cutiehack/live/checkin`);
  await visibleBalance(page, 30);
  await call("checkins:remove", { id: second }, cutieAdmin.identity);
  attendance.delete(second);
  await visibleBalance(page, 20, "06-removal-update");
  const remaining = [...attendance]
    .filter(([, tenant]) => tenant === "cutiehack")
    .map(([id]) => id);
  await call("checkins:deleteMany", { ids: remaining }, cutieAdmin.identity);
  remaining.forEach((id) => attendance.delete(id));
  await visibleBalance(page, 0, "07-empty-balance");
  await balance(attendee, "rosehack", 10);
  record("single and bulk removals update live, including zero; other hackathon unaffected");
} catch (error) {
  evidence.push({ name: "failure", result: String(error) });
  for (const [index, context] of contexts.entries()) {
    const page = context.pages()[0];
    if (page)
      await page
        .screenshot({ path: resolve(output, `failure-${index}.png`), fullPage: true })
        .catch(() => {});
  }
  process.exitCode = 1;
} finally {
  for (const [index, context] of contexts.entries()) {
    await context.tracing.stop({ path: resolve(output, `browser-${index}.zip`) }).catch(() => {});
  }
  await browser?.close();
  // Each cleanup operation targets only IDs created by this run.
  async function cleanup(label: string, task: () => Promise<unknown>) {
    try {
      await task();
    } catch {
      // Deleting a known fixture ID is idempotent; retry a transient CLI error.
      try {
        await task();
      } catch (error) {
        cleanupErrors.push(`${label}: ${String(error)}`);
      }
    }
  }
  for (const tenant of ["cutiehack", "rosehack"] as const) {
    const ids = [...attendance].filter(([, value]) => value === tenant).map(([id]) => id);
    const admin = users.find((user) =>
      user.email.endsWith(`-${tenant === "cutiehack" ? "cutie" : "rose"}-admin@example.invalid`),
    );
    if (ids.length && admin)
      await cleanup("attendance", () => call("checkins:deleteMany", { ids }, admin.identity));
  }
  for (const { table, id } of roleIds) {
    await cleanup(table, () => call(`${table}:remove`, { id }));
  }
  for (const user of users) {
    if (user.identity.sessionId)
      await cleanup("session", () =>
        call(
          "adapter:deleteOne",
          {
            input: { model: "session", where: [{ field: "_id", value: user.identity.sessionId }] },
          },
          undefined,
          "betterAuth",
        ),
      );
    await cleanup("user", () =>
      call(
        "adapter:deleteOne",
        {
          input: { model: "user", where: [{ field: "_id", value: user.id }] },
        },
        undefined,
        "betterAuth",
      ),
    );
  }
  await rm(temporary, { recursive: true, force: true });
  if (cleanupErrors.length) process.exitCode = 1;
  await writeFile(
    resolve(output, "report.json"),
    JSON.stringify(
      {
        runId,
        deployment,
        baseURL,
        passed: !process.exitCode,
        evidence,
        cleanupErrors,
        finishedAt: new Date().toISOString(),
      },
      null,
      2,
    ),
  );
  console.log(`Evidence: ${output}/report.json`);
  if (cleanupErrors.length) console.error("Fixture cleanup failed; inspect report.json.");
}
