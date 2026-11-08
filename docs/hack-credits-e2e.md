# Hack credits verification

Hack credits are earned at 10 credits per unique activity check-in, including
existing check-ins. Balances belong to the authenticated user within the selected
hackathon (`tenant`). There is no redemption in this version. Removing attendance
removes its contribution to the balance.

## Failure cases to exercise before release

- Existing attendance is missed, or duplicate historical records award twice.
- A successful check-in fails to update the visible balance without a reload.
- Retrying or concurrently scanning the same QR awards more than 10 credits.
- Checking into a second activity fails to add another 10 credits.
- CutieHack attendance contributes to Rose Hack, including matching activity IDs.
- Another user's attendance contributes to the signed-in user's balance.
- Signed-out visitors see another user's balance or a misleading zero balance.
- A participant, signed-out caller, pending admin, or another hackathon's admin
  can create or delete attendance and thereby alter credits.
- A stale placeholder QR or nonexistent account receives attendance/credits.
- Deleting attendance leaves stale credits; bulk deletion crosses hackathons.
- The initial loading state is shown as a final zero, or the balance is absent
  from the participant dashboard and check-in page.

## Repeatable evidence

Run the E2E scenario against a development deployment and a local Next.js server.
Use synthetic users and attendance, and remove these records after the run.
Save a machine-readable result, browser screenshots, and a browser trace so the
observed balances, tenant boundaries, and live update can be independently checked.
Do not use production data or a production deployment for fixture creation.

```sh
bun install
bunx playwright install chromium
bunx convex dev --once
bun run dev
# In a second terminal:
bun run test:e2e:credits
```

The runner requires Node.js 24+ and loads `.env` then `.env.local`. It refuses production deployments,
and requires the browser's Convex URL to match the configured dev deployment.
`E2E_BASE_URL` can select a different localhost port. The runner uses deployment
admin access through the Convex CLI to create short-lived synthetic Better Auth
users and sessions. It signs only those test sessions using the development
`BETTER_AUTH_SECRET`; the secret is never saved in the evidence. No email is sent.

The scenario imports legacy attendance with no migration, invokes the real
check-in mutation as tenant admins, and observes the real authenticated browser
subscriptions. It does not mock API responses. This verifies the check-in mutation
through to the participant's visible balance; physical camera scanning is outside
this scenario. Existing admin-role provisioning is assumed.

Each run writes `test-results/hack-credits-*/report.json`, PNG screenshots, and
Playwright trace ZIPs. Open a trace with `bunx playwright show-trace <path>`.
All test users, sessions, roles, and attendance are removed in `finally`; any
cleanup failures make the run fail and are recorded in the report. Reports and
browser artifacts stay local and are ignored by Git.
