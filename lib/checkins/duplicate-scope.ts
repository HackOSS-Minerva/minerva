export type CheckinDuplicateScope = {
  userid: string;
  eventid: string;
  tenant: string;
};

export function isDuplicateCheckin(
  existing: CheckinDuplicateScope,
  candidate: CheckinDuplicateScope,
): boolean {
  return (
    existing.userid === candidate.userid &&
    existing.eventid === candidate.eventid &&
    existing.tenant === candidate.tenant
  );
}
