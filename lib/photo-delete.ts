export interface PhotoDeleteTarget {
  tenant: string;
  eventId: string;
  uploadId: string;
  storagePath: string;
}

type PhotoIdentity = Pick<PhotoDeleteTarget, "tenant" | "eventId" | "uploadId">;

export interface PhotoDeleteDependencies {
  begin: (identity: PhotoIdentity) => Promise<{ status: string }>;
  remove: (storagePath: string) => Promise<void>;
  complete: (identity: PhotoIdentity) => Promise<{ status: string }>;
  rollback: (identity: PhotoIdentity) => Promise<unknown>;
}

export async function deletePhotoWithRollback(
  target: PhotoDeleteTarget,
  dependencies: PhotoDeleteDependencies,
): Promise<void> {
  const identity: PhotoIdentity = {
    tenant: target.tenant,
    eventId: target.eventId,
    uploadId: target.uploadId,
  };
  const started = await dependencies.begin(identity);
  if (started.status === "missing") return;

  try {
    await dependencies.remove(target.storagePath);
  } catch (error) {
    await dependencies.rollback(identity);
    throw error;
  }

  try {
    await dependencies.complete(identity);
  } catch {
    await dependencies.complete(identity);
  }
}
