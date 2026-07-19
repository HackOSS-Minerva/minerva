export type CanonicalCheckinRole =
  | "PARTICIPANT"
  | "JUDGE"
  | "SPEAKER"
  | "VOLUNTEER"
  | "VISITOR";

type IdentityRecord = { email: string };

export type CheckinRoleResolutionInput = {
  email: string;
  participants: IdentityRecord[];
  judges: IdentityRecord[];
  speakers: IdentityRecord[];
  volunteers: IdentityRecord[];
};

function normalizedEmail(email: string): string {
  return email.trim().toLowerCase();
}

/**
 * Resolves a check-in role from tenant-scoped application records.
 * An email linked to multiple roles remains a visitor because no canonical role
 * can be chosen safely.
 */
export function resolveCanonicalCheckinRole({
  email,
  participants,
  judges,
  speakers,
  volunteers,
}: CheckinRoleResolutionInput): CanonicalCheckinRole {
  const canonicalEmail = normalizedEmail(email);
  if (!canonicalEmail) return "VISITOR";

  const matches = [
    ["PARTICIPANT", participants],
    ["JUDGE", judges],
    ["SPEAKER", speakers],
    ["VOLUNTEER", volunteers],
  ] as const;
  const matchedRoles = matches
    .filter(([, records]) =>
      records.some(
        (record) => normalizedEmail(record.email) === canonicalEmail,
      ),
    )
    .map(([role]) => role);

  return matchedRoles.length === 1 ? matchedRoles[0] : "VISITOR";
}
