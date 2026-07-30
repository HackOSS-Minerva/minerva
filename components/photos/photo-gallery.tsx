"use client";

import { IconPhoto, IconTrash } from "@tabler/icons-react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { mergePhotoPages, PHOTO_PAGE_SIZE } from "@/lib/photos";
import type { PhotoRecord } from "@/types/photos";
import { PhotoViewer } from "@/components/photos/photo-viewer";

export type PhotosPaginationStatus =
  | "LoadingFirstPage"
  | "CanLoadMore"
  | "LoadingMore"
  | "Exhausted";

interface PhotoGalleryProps {
  photos: PhotoRecord[];
  status: PhotosPaginationStatus;
  onLoadMore: (count: number) => void;
  onDelete?: (photo: PhotoRecord) => void;
}

export function PhotoGallery({
  photos,
  status,
  onLoadMore,
  onDelete,
}: PhotoGalleryProps) {
  const visiblePhotos = mergePhotoPages([
    photos.filter((photo) => photo.status === "active"),
  ]);

  if (status === "LoadingFirstPage") {
    return null;
  }

  if (visiblePhotos.length === 0) {
    return (
      <div className="flex min-h-56 flex-col items-center justify-center rounded-xl border border-dashed bg-muted/20 px-6 text-center">
        <div className="rounded-full border bg-background p-3 shadow-sm">
          <IconPhoto className="size-6 text-muted-foreground" />
        </div>
        <h2 className="mt-4 font-semibold">No photos yet</h2>
        <p className="mt-1 max-w-sm text-sm text-muted-foreground">
          Add the first photo and it will appear here for everyone at the event.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-3 md:grid-cols-3">
        {visiblePhotos.map((photo) => (
          <article
            key={photo._id}
            className="group relative overflow-hidden rounded-xl bg-muted"
          >
            <PhotoViewer filename={photo.filename} url={photo.downloadUrl}>
              <button
                type="button"
                className="relative block aspect-square w-full overflow-hidden outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                aria-label={`Open ${photo.filename}`}
              >
                <Image
                  src={photo.downloadUrl}
                  alt={photo.filename}
                  fill
                  sizes="(max-width: 768px) 50vw, 33vw"
                  className="object-cover transition-transform duration-300 group-hover:scale-[1.02]"
                />
              </button>
            </PhotoViewer>
            {onDelete && (
              <Button
                type="button"
                variant="destructive"
                size="icon-sm"
                className="absolute top-2 right-2 opacity-100 shadow-md md:opacity-0 md:transition-opacity md:group-hover:opacity-100 md:focus-visible:opacity-100"
                aria-label={`Delete ${photo.filename}`}
                onClick={() => onDelete(photo)}
              >
                <IconTrash />
              </Button>
            )}
          </article>
        ))}
      </div>

      {(status === "CanLoadMore" || status === "LoadingMore") && (
        <div className="flex justify-center">
          <Button
            type="button"
            variant="outline"
            disabled={status === "LoadingMore"}
            onClick={() => onLoadMore(PHOTO_PAGE_SIZE)}
          >
            {status === "LoadingMore" ? "Loading photos…" : "Load more photos"}
          </Button>
        </div>
      )}
    </div>
  );
}
