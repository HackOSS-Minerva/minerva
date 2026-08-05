"use client";

import { useMutation } from "convex/react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { api } from "@/convex/_generated/api";
import { compress } from "@/lib/compress";
import {
  PHOTO_CONCURRENCY,
  createPhotoStoragePath,
  validatePhotoFiles,
} from "@/lib/photos";
import { runWithConcurrency } from "@/lib/photo-queue";
import {
  PhotoUploadFailure,
  processPhotoUpload,
  readPhotoDimensions,
  type PhotoUploadContext,
  type PhotoUploadDependencies,
  type PhotoUploadUpdate,
} from "@/lib/photo-upload";
import { deleteStorageFile, uploadStorageFile } from "@/lib/storage";
import type { PhotoUploadItem } from "@/types/photos";

interface UsePhotoUploadOptions extends PhotoUploadContext {
  enabled: boolean;
}

export function usePhotoUpload({
  tenant,
  eventId,
  eventName,
  enabled,
}: UsePhotoUploadOptions) {
  const finalize = useMutation(api.photos.finalize);
  const [items, setItems] = useState<PhotoUploadItem[]>([]);
  const mountedRef = useRef(true);
  const frameRef = useRef<number | null>(null);
  const pendingProgressRef = useRef(new Map<string, number>());

  useEffect(() => {
    mountedRef.current = true;

    return () => {
      mountedRef.current = false;

      if (frameRef.current !== null) {
        cancelAnimationFrame(frameRef.current);
        frameRef.current = null;
      }

      pendingProgressRef.current.clear();
    };
  }, []);

  const applyUpdate = useCallback(
    (uploadId: string, update: PhotoUploadUpdate) => {
      if (!mountedRef.current) return;

      setItems((current) =>
        current.map((item) =>
          item.uploadId === uploadId ? { ...item, ...update } : item,
        ),
      );
    },
    [],
  );

  const updateItem = useCallback(
    (uploadId: string, update: PhotoUploadUpdate) => {
      if (!mountedRef.current) return;

      if (
        Object.keys(update).length === 1 &&
        typeof update.progress === "number"
      ) {
        pendingProgressRef.current.set(uploadId, update.progress);
        if (frameRef.current === null) {
          frameRef.current = requestAnimationFrame(() => {
            const pending = pendingProgressRef.current;
            pendingProgressRef.current = new Map();
            frameRef.current = null;
            setItems((current) =>
              current.map((item) => {
                const progress = pending.get(item.uploadId);
                return progress === undefined ? item : { ...item, progress };
              }),
            );
          });
        }
        return;
      }

      applyUpdate(uploadId, update);
    },
    [applyUpdate],
  );

  const dependencies = useMemo<PhotoUploadDependencies>(
    () => ({
      compress,
      readDimensions: readPhotoDimensions,
      upload: uploadStorageFile,
      finalize,
      remove: deleteStorageFile,
    }),
    [finalize],
  );

  const context = useMemo(
    () => ({ tenant, eventId, eventName }),
    [eventId, eventName, tenant],
  );

  const processItems = useCallback(
    async (candidates: PhotoUploadItem[]) => {
      await runWithConcurrency(
        candidates,
        PHOTO_CONCURRENCY,
        async (candidate) => {
          try {
            return await processPhotoUpload(
              candidate,
              context,
              dependencies,
              (update) => updateItem(candidate.uploadId, update),
            );
          } catch (error) {
            const failure =
              error instanceof PhotoUploadFailure
                ? error
                : new PhotoUploadFailure({
                    source: "firebase",
                    code: "PHOTO_UPLOAD_FAILED",
                    message: "Upload interrupted. Try this photo again.",
                    storagePath: createPhotoStoragePath(
                      tenant,
                      eventId,
                      candidate.uploadId,
                    ),
                  });
            applyUpdate(candidate.uploadId, {
              stage: "failed",
              error: {
                source: failure.source,
                code: failure.code,
                message: failure.message,
                storagePath: failure.storagePath,
              },
            });
            throw failure;
          }
        },
      );
    },
    [applyUpdate, context, dependencies, eventId, tenant, updateItem],
  );

  const addFiles = useCallback(
    (files: File[]) => {
      if (!enabled || files.length === 0) return;

      const validation = validatePhotoFiles(files);
      const accepted = validation.accepted.map<PhotoUploadItem>(
        (sourceFile) => ({
          uploadId: crypto.randomUUID(),
          sourceFile,
          stage: "queued",
          progress: 0,
          error: null,
        }),
      );
      const rejected = validation.rejected.map<PhotoUploadItem>(
        ({ file, reason }) => ({
          uploadId: crypto.randomUUID(),
          sourceFile: file,
          stage: "failed",
          progress: 0,
          error: {
            source: "validation",
            code: "PHOTO_VALIDATION_FAILED",
            message: reason,
          },
        }),
      );

      setItems((current) => [...accepted, ...rejected, ...current]);
      void processItems(accepted);
    },
    [enabled, processItems],
  );

  const retry = useCallback(
    (uploadId: string) => {
      const item = items.find((candidate) => candidate.uploadId === uploadId);
      if (!enabled || !item || item.stage !== "failed") return;

      const retryItem = {
        ...item,
        stage: "queued" as const,
        progress: 0,
        error: null,
      };
      applyUpdate(uploadId, retryItem);
      void processItems([retryItem]);
    },
    [applyUpdate, enabled, items, processItems],
  );

  const clearCompleted = useCallback(() => {
    setItems((current) => current.filter((item) => item.stage !== "complete"));
  }, []);

  return {
    items,
    addFiles,
    retry,
    clearCompleted,
    isProcessing: items.some(
      (item) => item.stage !== "complete" && item.stage !== "failed",
    ),
  };
}
