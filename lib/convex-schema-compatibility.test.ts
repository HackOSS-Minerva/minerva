import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import test from "node:test";

const schema = readFileSync(resolve(process.cwd(), "convex/schema.ts"), "utf8");

test("declares every shared project-vetting table", () => {
  for (const table of [
    "submissionGitIdentities",
    "repoVettingRuns",
    "repoVettingRepos",
    "repoVettingContributors",
    "gitIdentityMappings",
    "repoVettingFindings",
  ]) {
    assert.match(schema, new RegExp(`${table}: defineTable`));
  }
});

test("declares vetting and tenant-safe check-in indexes", () => {
  for (const index of [
    '"by_tenant", ["tenant"]',
    '"by_tenant_vetted", ["tenant", "vetted"]',
    '"by_vetting_status", ["vettingStatus"]',
    '"by_user_event_tenant", ["userid", "eventid", "tenant"]',
  ]) {
    assert.ok(schema.includes(index), `Missing index ${index}`);
  }
});
