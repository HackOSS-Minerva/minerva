import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import test from "node:test";

const schema = readFileSync(resolve(process.cwd(), "convex/schema.ts"), "utf8");

test("declares the tenant-safe check-in duplicate index", () => {
  assert.ok(
    schema.includes('"by_user_event_tenant", ["userid", "eventid", "tenant"]'),
    "Missing tenant-safe check-in index",
  );
});
