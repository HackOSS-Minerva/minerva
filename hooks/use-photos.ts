"use client";

import { useCallback, useEffect, useRef, useState } from "react";

import { compress, MAX_IMAGE_FILE_SIZE } from "@/lib/compress";
import type { PhotoItem, PhotoPage } from "@/lib/photos/google-photos";

const PHOTO_COMPRESSION_OPTIONS = {
  maxWidth: 1920,
  maxHeight: 1920,
  quality: 0.82,
  mimeType: "image/jpeg",
  acceptedTypes: ["image/jpeg", "image/png", "image/webp"],
  maxFileSize: MAX_IMAGE_FILE_SIZE,
} as const;

interface UsePhotosResult {
  photos: PhotoItem[];
  loading: boolean;
  loadingMore: boolean;
  removingPhotoId: string | null;
  uploading: boolean;
  hasMore: boolean;
  hasLoadedGallery: boolean;
  error: string | null;
  upload: (files: readonly File[]) => Promise<UploadResult>;
  loadMore: () => Promise<void>;
  removePhoto: (mediaItemId: string) => Promise<boolean>;
}

export interface UploadResult {
  uploadedCount: number;
  failedFiles: File[];
}

const isPhoto = (value: unknown): value is PhotoItem => {
  if (!value || typeof value !== "object") return false;
  const photo = value as Record<string, unknown>;
  return (
    typeof photo.id === "string" &&
    typeof photo.filename === "string" &&
    typeof photo.thumbnailUrl === "string" &&
    typeof photo.viewerUrl === "string"
  );
};

const mergePhotos = (
  current: readonly PhotoItem[],
  incoming: readonly PhotoItem[],
): PhotoItem[] => {
  const photos = new Map(current.map((photo) => [photo.id, photo]));
  for (const photo of incoming) photos.set(photo.id, photo);
  return Array.from(photos.values());
};

const refreshLatestPhotoPage = async (
  fetchPage: (pageToken?: string) => Promise<PhotoPage>,
  currentPhotos: readonly PhotoItem[],
  loadedPageCount: number,
  currentNextPageToken?: string,
): Promise<PhotoPage> => {
  const page = await fetchPage();
  if (loadedPageCount <= 1) return page;

  const refreshedIds = new Set(page.photos.map(({ id }) => id));
  return {
    photos: [
      ...page.photos,
      ...currentPhotos.filter(({ id }) => !refreshedIds.has(id)),
    ],
    ...(currentNextPageToken ? { nextPageToken: currentNextPageToken } : {}),
  };
};

const uploadPhotoBatch = async (
  files: readonly File[],
  uploadFile: (file: File) => Promise<void>,
): Promise<UploadResult> => {
  const failedFiles: File[] = [];
  let uploadedCount = 0;

  for (const file of files) {
    try {
      await uploadFile(file);
      uploadedCount += 1;
    } catch {
      failedFiles.push(file);
    }
  }

  return { uploadedCount, failedFiles };
};

const createPhotoListCoordinator = () => {
  let activeOperations = 0;
  let currentOperation = 0;

  return {
    begin: ({ skipIfBusy = false }: { skipIfBusy?: boolean } = {}) => {
      if (skipIfBusy && activeOperations > 0) return null;
      activeOperations += 1;
      currentOperation += 1;
      return currentOperation;
    },
    finish: () => {
      activeOperations = Math.max(0, activeOperations - 1);
    },
    isCurrent: (operation: number) => {
      return operation === currentOperation;
    },
  };
};

export const usePhotos = (tenant: string): UsePhotosResult => {
  const [photos, setPhotos] = useState<PhotoItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [removingPhotoId, setRemovingPhotoId] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [hasLoadedGallery, setHasLoadedGallery] = useState(false);
  const [nextPageToken, setNextPageToken] = useState<string>();
  const [error, setError] = useState<string | null>(null);
  const photosRef = useRef<PhotoItem[]>([]);
  const nextPageTokenRef = useRef<string | undefined>(undefined);
  const loadedPageCountRef = useRef(1);
  const loadMoreInFlightRef = useRef(false);
  const removeInFlightRef = useRef(false);
  const listCoordinatorRef = useRef(createPhotoListCoordinator());

  const updateNextPageToken = useCallback((pageToken?: string) => {
    nextPageTokenRef.current = pageToken;
    setNextPageToken(pageToken);
  }, []);

  const fetchPage = useCallback(
    async (pageToken?: string): Promise<PhotoPage> => {
      const searchParams = new URLSearchParams({ tenant });
      if (pageToken) searchParams.set("pageToken", pageToken);

      const response = await fetch(`/api/photos?${searchParams.toString()}`, {
        cache: "no-store",
      });
      if (!response.ok) throw new Error("PHOTO_LIST_FAILED");

      const body = (await response.json()) as {
        photos?: unknown;
        nextPageToken?: unknown;
      };
      if (
        !Array.isArray(body.photos) ||
        !body.photos.every(isPhoto) ||
        (body.nextPageToken !== undefined &&
          typeof body.nextPageToken !== "string")
      ) {
        throw new Error("PHOTO_LIST_FAILED");
      }

      return {
        photos: body.photos,
        ...(body.nextPageToken ? { nextPageToken: body.nextPageToken } : {}),
      };
    },
    [tenant],
  );

  const runRefresh = useCallback(
    async (supersede = false): Promise<void> => {
      const coordinator = listCoordinatorRef.current;
      const operation = coordinator.begin({ skipIfBusy: !supersede });
      if (operation === null) return;

      try {
        const page = await refreshLatestPhotoPage(
          fetchPage,
          photosRef.current,
          loadedPageCountRef.current,
          nextPageTokenRef.current,
        );
        if (!coordinator.isCurrent(operation)) return;

        photosRef.current = page.photos;
        setPhotos(page.photos);
        updateNextPageToken(page.nextPageToken);
        setHasLoadedGallery(true);
        setError(null);
      } catch {
        if (coordinator.isCurrent(operation)) {
          setError("Unable to load photos.");
        }
      } finally {
        coordinator.finish();
        if (coordinator.isCurrent(operation)) setLoading(false);
      }
    },
    [fetchPage, updateNextPageToken],
  );

  useEffect(() => {
    void runRefresh();
  }, [runRefresh]);

  const loadMore = useCallback(async (): Promise<void> => {
    const pageToken = nextPageTokenRef.current;
    if (!pageToken || loadMoreInFlightRef.current) return;

    const coordinator = listCoordinatorRef.current;
    const operation = coordinator.begin();
    if (operation === null) return;

    loadMoreInFlightRef.current = true;
    setLoadingMore(true);
    setError(null);
    try {
      const page = await fetchPage(pageToken);
      if (!coordinator.isCurrent(operation)) return;

      const merged = mergePhotos(photosRef.current, page.photos);
      photosRef.current = merged;
      setPhotos(merged);
      loadedPageCountRef.current += 1;
      updateNextPageToken(page.nextPageToken);
    } catch {
      if (coordinator.isCurrent(operation)) {
        setError("Unable to load more photos.");
      }
    } finally {
      coordinator.finish();
      loadMoreInFlightRef.current = false;
      setLoadingMore(false);
    }
  }, [fetchPage, updateNextPageToken]);

  const upload = useCallback(
    async (files: readonly File[]): Promise<UploadResult> => {
      setUploading(true);
      setError(null);

      try {
        const result = await uploadPhotoBatch(files, async (file) => {
          const compressed = await compress(file, PHOTO_COMPRESSION_OPTIONS);
          const formData = new FormData();
          formData.set("tenant", tenant);
          formData.set("photo", compressed);

          const response = await fetch("/api/photos/upload", {
            method: "POST",
            body: formData,
          });
          if (!response.ok) throw new Error("PHOTO_UPLOAD_FAILED");
        });

        if (result.uploadedCount > 0) {
          await runRefresh(true);
        }

        if (result.failedFiles.length > 0) {
          const noun = result.failedFiles.length === 1 ? "photo" : "photos";
          setError(
            `Unable to upload ${result.failedFiles.length} ${noun}. Retry the selected ${noun}.`,
          );
        }

        return result;
      } finally {
        setUploading(false);
      }
    },
    [runRefresh, tenant],
  );

  const removePhoto = useCallback(
    async (mediaItemId: string): Promise<boolean> => {
      if (removeInFlightRef.current) return false;

      removeInFlightRef.current = true;
      setRemovingPhotoId(mediaItemId);

      try {
        const response = await fetch("/api/photos", {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ tenant, mediaItemId }),
        });
        if (!response.ok) throw new Error("PHOTO_REMOVE_FAILED");

        const remaining = photosRef.current.filter(
          (photo) => photo.id !== mediaItemId,
        );
        photosRef.current = remaining;
        setPhotos(remaining);
        await runRefresh(true);
        return true;
      } catch {
        return false;
      } finally {
        removeInFlightRef.current = false;
        setRemovingPhotoId(null);
      }
    },
    [runRefresh, tenant],
  );

  return {
    photos,
    loading,
    loadingMore,
    removingPhotoId,
    uploading,
    hasMore: Boolean(nextPageToken),
    hasLoadedGallery,
    error,
    upload,
    loadMore,
    removePhoto,
  };
};
