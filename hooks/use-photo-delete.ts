"use client";

import { useMutation } from "convex/react";
import { useCallback, useMemo, useState } from "react";
import { api } from "@/convex/_generated/api";
import {
  deletePhotoWithRollback,
  type PhotoDeleteDependencies,
} from "@/lib/photo-delete";
import { deleteStorageFile } from "@/lib/storage";
import type { PhotoRecord } from "@/types/photos";

export function usePhotoDelete() {
  const begin = useMutation(api.photos.beginDelete);
  const complete = useMutation(api.photos.completeDelete);
  const rollback = useMutation(api.photos.rollbackDelete);
  const [deletingUploadId, setDeletingUploadId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const dependencies = useMemo<PhotoDeleteDependencies>(
    () => ({
      begin,
      complete,
      rollback,
      remove: deleteStorageFile,
    }),
    [begin, complete, rollback],
  );

  const deletePhoto = useCallback(
    async (photo: PhotoRecord) => {
      setDeletingUploadId(photo.uploadId);
      setError(null);

      try {
        await deletePhotoWithRollback(
          {
            tenant: photo.tenant,
            eventId: photo.eventId,
            uploadId: photo.uploadId,
            storagePath: photo.storagePath,
          },
          dependencies,
        );
      } catch {
        setError("The photo could not be deleted. Try again.");
        throw new Error("PHOTO_DELETE_FAILED");
      } finally {
        setDeletingUploadId(null);
      }
    },
    [dependencies],
  );

  return {
    deletePhoto,
    isDeleting: deletingUploadId !== null,
    error,
  };
}
