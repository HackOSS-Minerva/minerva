import assert from "node:assert/strict";
import test from "node:test";
import { isDuplicateCheckin } from "./duplicate-scope.ts";

test("only treats matching user, event, and tenant as a duplicate check-in", () => {
  const existing = {
    userid: "shared-user",
    eventid: "opening-ceremony",
    tenant: "tenant-a",
  };

  assert.equal(
    isDuplicateCheckin(existing, {
      userid: "shared-user",
      eventid: "opening-ceremony",
      tenant: "tenant-a",
    }),
    true,
  );
  assert.equal(
    isDuplicateCheckin(existing, {
      userid: "shared-user",
      eventid: "opening-ceremony",
      tenant: "tenant-b",
    }),
    false,
  );
});
