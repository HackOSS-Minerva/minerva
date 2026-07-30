"use client";

import { usePaginatedQuery, useQuery } from "convex/react";
import { useState } from "react";
import { api } from "@/convex/_generated/api";
import { PhotoGallery } from "@/components/photos/photo-gallery";
import { PhotoUploader } from "@/components/photos/photo-uploader";
import { StorageUsage } from "@/components/photos/storage-usage";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { usePhotoDelete } from "@/hooks/use-photo-delete";
import { usePhotoUpload } from "@/hooks/use-photo-upload";
import { PHOTO_PAGE_SIZE, mergePhotoPages } from "@/lib/photos";
import type { PhotoRecord } from "@/types/photos";

interface PhotosPageProps {
  tenant: string;
  eventId: string;
  eventName: string;
  isLive: boolean;
  mode: "participant" | "admin";
}

export function PhotosPage({
  tenant,
  eventId,
  eventName,
  isLive,
  mode,
}: PhotosPageProps) {
  const { results, status, loadMore } = usePaginatedQuery(
    api.photos.list,
    { tenant, eventId },
    { initialNumItems: PHOTO_PAGE_SIZE },
  );
  const usage = useQuery(
    api.photos.getUsage,
    mode === "admin" ? { tenant, eventId } : "skip",
  );
  const uploader = usePhotoUpload({
    tenant,
    eventId,
    eventName,
    enabled: isLive,
  });
  const deletion = usePhotoDelete();
  const [pendingDelete, setPendingDelete] = useState<PhotoRecord | null>(null);
  const photos = mergePhotoPages([results]);

  const confirmDelete = async () => {
    if (!pendingDelete) return;

    try {
      await deletion.deletePhoto(pendingDelete);
      setPendingDelete(null);
    } catch {
      setPendingDelete(null);
    }
  };

  return (
    <div className="space-y-8">
      {mode === "participant" && (
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink href={`/${tenant}/live/dashboard`}>
                Dashboard
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>Photos</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
      )}

      <header>
        <p className="text-xs font-medium tracking-[0.18em] text-muted-foreground uppercase">
          Shared event album
        </p>
        <h1 className="mt-2 text-2xl font-bold tracking-tight md:text-3xl">
          {eventName} photos
        </h1>
        <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
          Add moments as they happen. New photos appear here for everyone at the
          event.
        </p>
      </header>

      {mode === "admin" && usage && (
        <StorageUsage
          usedBytes={usage.usedBytes}
          quotaBytes={usage.quotaBytes}
        />
      )}

      <PhotoUploader
        enabled={isLive}
        items={uploader.items}
        isProcessing={uploader.isProcessing}
        onFilesSelected={uploader.addFiles}
        onRetry={uploader.retry}
        onClearCompleted={uploader.clearCompleted}
      />

      {deletion.error && (
        <p role="alert" className="text-sm text-destructive">
          {deletion.error}
        </p>
      )}

      <PhotoGallery
        photos={photos}
        status={status}
        onLoadMore={loadMore}
        onDelete={mode === "admin" ? setPendingDelete : undefined}
      />

      <Dialog
        open={pendingDelete !== null}
        onOpenChange={(open) => {
          if (!open && !deletion.isDeleting) setPendingDelete(null);
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete photo?</DialogTitle>
            <DialogDescription>
              This removes the photo from the shared album for everyone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              disabled={deletion.isDeleting}
              onClick={() => setPendingDelete(null)}
            >
              Cancel
            </Button>
            <Button
              type="button"
              variant="destructive"
              disabled={deletion.isDeleting}
              onClick={() => void confirmDelete()}
            >
              {deletion.isDeleting ? "Deleting…" : "Delete photo"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
