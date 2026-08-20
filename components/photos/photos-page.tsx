"use client";

import Image from "next/image";
import { useRef, useState } from "react";
import { IconPhotoMinus } from "@tabler/icons-react";

import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { usePhotos } from "@/hooks/use-photos";
import type { PhotoEvent } from "@/lib/photos/google-photos";
import type { ClientPhotoItem } from "@/lib/photos/photo-client";

interface PhotosPageProps {
  event: PhotoEvent;
  canManage?: boolean;
}

export function PhotosPage({ event, canManage = false }: PhotosPageProps) {
  const {
    photos,
    loading,
    loadingMore,
    removingPhotoId,
    uploading,
    hasMore,
    hasLoadedGallery,
    error,
    upload,
    loadMore,
    removePhoto,
  } = usePhotos(event.tenant);
  const [files, setFiles] = useState<File[]>([]);
  const [selectedPhoto, setSelectedPhoto] = useState<ClientPhotoItem | null>(
    null,
  );
  const [photoToRemove, setPhotoToRemove] = useState<ClientPhotoItem | null>(
    null,
  );
  const [removeError, setRemoveError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const isLive = event.status === "live";

  const handleUpload = async () => {
    if (!files.length || !isLive) return;
    const result = await upload(files);
    setFiles(result.failedFiles);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleRemove = async () => {
    if (!photoToRemove) return;
    setRemoveError(null);
    const removed = await removePhoto(photoToRemove.id);
    if (removed) {
      if (selectedPhoto?.id === photoToRemove.id) setSelectedPhoto(null);
      setPhotoToRemove(null);
    } else {
      setRemoveError("Unable to remove photo from the album.");
    }
  };

  return (
    <main className="w-full space-y-6">
      <header>
        <h1 className="text-2xl font-bold md:text-3xl">
          {event.eventName} Photos
        </h1>
        <p className="mt-1 text-muted-foreground">
          Upload photos and see what everyone is sharing.
        </p>
      </header>

      <div className="flex flex-col gap-3 rounded-lg border bg-card p-4 sm:flex-row sm:items-end">
        <div className="min-w-0 flex-1 space-y-2">
          <label htmlFor="event-photos" className="text-sm font-medium">
            Choose photos
          </label>
          <input
            ref={fileInputRef}
            id="event-photos"
            type="file"
            className="sr-only"
            accept="image/jpeg,image/png,image/webp"
            multiple
            disabled={!isLive || uploading}
            onChange={(event) =>
              setFiles(Array.from(event.currentTarget.files ?? []))
            }
          />
          <div className="flex min-h-9 items-center gap-3">
            <Button
              type="button"
              variant="outline"
              disabled={!isLive || uploading}
              onClick={() => fileInputRef.current?.click()}
            >
              Choose files
            </Button>
            {files.length > 0 ? (
              <p className="text-xs text-muted-foreground" aria-live="polite">
                {files.length} {files.length === 1 ? "photo" : "photos"}{" "}
                selected
              </p>
            ) : null}
          </div>
        </div>
        <Button
          type="button"
          disabled={!isLive || uploading || files.length === 0}
          onClick={handleUpload}
        >
          {uploading ? "Uploading…" : "Upload"}
        </Button>
      </div>

      {!isLive ? (
        <p className="text-sm text-muted-foreground">
          Uploads are available while the event is live.
        </p>
      ) : null}
      {error ? (
        <p role="status" className="text-sm text-destructive">
          {error}
        </p>
      ) : null}

      {loading ? (
        <p className="text-sm text-muted-foreground">Loading photos…</p>
      ) : !hasLoadedGallery && photos.length === 0 ? null : photos.length ===
        0 ? (
        <div className="rounded-lg border border-dashed px-6 py-16 text-center">
          <p className="font-medium">No photos yet</p>
          <p className="mt-1 text-sm text-muted-foreground">
            Be the first to share a photo from the event.
          </p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-4">
            {photos.map((photo) => (
              <div
                key={photo.id}
                className="relative aspect-square overflow-hidden rounded-md bg-muted"
              >
                <button
                  type="button"
                  aria-label={`View ${photo.filename}`}
                  className="absolute inset-0 outline-none focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-ring"
                  onClick={() => setSelectedPhoto(photo)}
                >
                  <Image
                    src={photo.thumbnailUrl}
                    alt={photo.filename}
                    fill
                    sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, 25vw"
                    className="object-cover transition-transform hover:scale-[1.02]"
                  />
                </button>
                {canManage ? (
                  <Button
                    type="button"
                    variant="destructive"
                    size="icon-sm"
                    className="absolute top-2 right-2 shadow-md"
                    aria-label={`Remove ${photo.filename} from album`}
                    title="Remove from album"
                    disabled={removingPhotoId !== null}
                    onClick={() => {
                      setRemoveError(null);
                      setPhotoToRemove(photo);
                    }}
                  >
                    <IconPhotoMinus />
                  </Button>
                ) : null}
              </div>
            ))}
          </div>
          {hasMore ? (
            <div className="flex justify-center">
              <Button
                type="button"
                variant="outline"
                disabled={loadingMore || uploading}
                onClick={() => void loadMore()}
              >
                {loadingMore ? "Loading…" : "Load more"}
              </Button>
            </div>
          ) : null}
        </>
      )}

      <Dialog
        open={selectedPhoto !== null}
        onOpenChange={(open) => {
          if (!open) setSelectedPhoto(null);
        }}
      >
        <DialogContent className="max-w-5xl border-0 bg-black p-2 [&>button]:text-white sm:max-w-5xl">
          <DialogHeader className="sr-only">
            <DialogTitle>
              {selectedPhoto?.filename ?? "Event photo"}
            </DialogTitle>
            <DialogDescription>Full-size event photo</DialogDescription>
          </DialogHeader>
          {selectedPhoto ? (
            <div className="relative h-[80vh] w-full">
              <Image
                src={selectedPhoto.viewerUrl}
                alt={selectedPhoto.filename}
                fill
                sizes="100vw"
                className="object-contain"
              />
            </div>
          ) : null}
        </DialogContent>
      </Dialog>

      <AlertDialog
        open={photoToRemove !== null}
        onOpenChange={(open) => {
          if (!open && removingPhotoId === null) {
            setPhotoToRemove(null);
            setRemoveError(null);
          }
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remove photo from album?</AlertDialogTitle>
            <AlertDialogDescription>
              This removes {photoToRemove?.filename ?? "this photo"} from the
              event album. It does not permanently delete the photo from Google
              Photos.
            </AlertDialogDescription>
          </AlertDialogHeader>
          {removeError && photoToRemove ? (
            <p role="status" className="text-sm text-destructive">
              {removeError}
            </p>
          ) : null}
          <AlertDialogFooter>
            <AlertDialogCancel disabled={removingPhotoId !== null}>
              Cancel
            </AlertDialogCancel>
            <Button
              type="button"
              variant="destructive"
              disabled={removingPhotoId !== null}
              onClick={() => void handleRemove()}
            >
              {removingPhotoId !== null ? "Removing…" : "Remove from album"}
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </main>
  );
}
