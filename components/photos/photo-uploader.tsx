"use client";

import {
  IconAlertCircle,
  IconCheck,
  IconCloudUpload,
  IconLoader2,
  IconRefresh,
  IconTrash,
} from "@tabler/icons-react";
import { useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import type { PhotoUploadItem } from "@/types/photos";

interface PhotoUploaderProps {
  enabled: boolean;
  isProcessing: boolean;
  items: PhotoUploadItem[];
  onFilesSelected: (files: File[]) => void;
  onRetry: (uploadId: string) => void;
  onClearCompleted: () => void;
}

const stageLabel: Record<PhotoUploadItem["stage"], string> = {
  queued: "Queued",
  compressing: "Compressing",
  uploading: "Uploading",
  finalizing: "Adding to album",
  complete: "Added",
  failed: "Needs attention",
};

export function PhotoUploader({
  enabled,
  isProcessing,
  items,
  onFilesSelected,
  onRetry,
  onClearCompleted,
}: PhotoUploaderProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const hasCompleted = items.some((item) => item.stage === "complete");

  if (!enabled) {
    return (
      <Card className="border-dashed bg-muted/25 shadow-none">
        <CardContent className="flex items-center gap-3 text-sm text-muted-foreground">
          <IconCloudUpload className="size-5" />
          Uploads are closed for this event.
        </CardContent>
      </Card>
    );
  }

  const selectFiles = (files: FileList | null) => {
    if (!files || files.length === 0) return;
    onFilesSelected(Array.from(files));
    if (inputRef.current) inputRef.current.value = "";
  };

  return (
    <section className="space-y-3" aria-label="Upload event photos">
      <div
        className={cn(
          "group relative overflow-hidden rounded-xl border border-dashed bg-card px-6 py-8 text-center transition-colors",
          isDragging
            ? "border-primary bg-primary/5"
            : "border-border hover:border-primary/50",
          isProcessing && "pointer-events-none opacity-70",
        )}
        onDragEnter={(event) => {
          event.preventDefault();
          setIsDragging(true);
        }}
        onDragOver={(event) => event.preventDefault()}
        onDragLeave={(event) => {
          if (!event.currentTarget.contains(event.relatedTarget as Node)) {
            setIsDragging(false);
          }
        }}
        onDrop={(event) => {
          event.preventDefault();
          setIsDragging(false);
          selectFiles(event.dataTransfer.files);
        }}
      >
        <div className="mx-auto flex max-w-md flex-col items-center">
          <div className="mb-4 rounded-full border bg-background p-3 shadow-sm">
            <IconCloudUpload className="size-6 text-primary" />
          </div>
          <h2 className="text-base font-semibold">
            Add your view of the event
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Drop up to 25 JPEG, PNG, or WebP photos. Each source can be up to 20
            MB.
          </p>
          <Button
            className="mt-4"
            type="button"
            disabled={isProcessing}
            onClick={() => inputRef.current?.click()}
          >
            Choose photos
          </Button>
          <input
            ref={inputRef}
            className="sr-only"
            type="file"
            aria-label="Choose event photos"
            accept="image/jpeg,image/png,image/webp"
            multiple
            disabled={isProcessing}
            onChange={(event) => selectFiles(event.target.files)}
          />
        </div>
      </div>

      {items.length > 0 && (
        <div className="rounded-xl border bg-card" aria-live="polite">
          <div className="flex items-center justify-between border-b px-4 py-3">
            <p className="text-sm font-medium">
              {items.length} {items.length === 1 ? "photo" : "photos"}
            </p>
            {hasCompleted && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={onClearCompleted}
              >
                <IconTrash />
                Clear added
              </Button>
            )}
          </div>
          <ul className="divide-y">
            {items.map((item) => (
              <li
                key={item.uploadId}
                className="grid gap-2 px-4 py-3 sm:grid-cols-[1fr_auto] sm:items-center"
              >
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    {item.stage === "complete" ? (
                      <IconCheck className="size-4 shrink-0 text-emerald-600" />
                    ) : item.stage === "failed" ? (
                      <IconAlertCircle className="size-4 shrink-0 text-destructive" />
                    ) : (
                      <IconLoader2 className="size-4 shrink-0 animate-spin text-muted-foreground" />
                    )}
                    <span className="truncate text-sm font-medium">
                      {item.sourceFile.name}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {stageLabel[item.stage]}
                    </span>
                  </div>
                  {item.stage === "uploading" && (
                    <div
                      className="mt-2 h-1.5 overflow-hidden rounded-full bg-muted"
                      role="progressbar"
                      aria-label={`Upload progress for ${item.sourceFile.name}`}
                      aria-valuemin={0}
                      aria-valuemax={100}
                      aria-valuenow={Math.round(item.progress * 100)}
                    >
                      <div
                        className="h-full rounded-full bg-primary transition-[width]"
                        style={{ width: `${item.progress * 100}%` }}
                      />
                    </div>
                  )}
                  {item.error && (
                    <p className="mt-1 text-xs text-destructive">
                      {item.error.message}
                    </p>
                  )}
                </div>
                {item.stage === "failed" && (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    aria-label={`Retry ${item.sourceFile.name}`}
                    onClick={() => onRetry(item.uploadId)}
                  >
                    <IconRefresh />
                    Retry
                  </Button>
                )}
              </li>
            ))}
          </ul>
        </div>
      )}
    </section>
  );
}
