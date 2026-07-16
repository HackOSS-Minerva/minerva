import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import test from "node:test";

const read = (path: string) =>
  readFileSync(resolve(process.cwd(), path), "utf8");

test("generic application forms keep their lock modal and submit guards", () => {
  const wrapper = read("components/forms/wrapper.tsx");
  const fields = read("components/forms/fields.tsx");
  const footer = read("components/forms/footer.tsx");

  assert.match(wrapper, /<FormLockModal form=\{form\}/);
  assert.match(fields, /useFormLock/);
  assert.match(fields, /if \(isLocked\) return/);
  assert.match(footer, /disabled=\{isLocked\}/);
});

test("project submission keeps its submission lock modal", () => {
  const page = read("components/live/submit/submission-form-page.tsx");
  assert.match(page, /<FormLockModal form="submission"/);
});
