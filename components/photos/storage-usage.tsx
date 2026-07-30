import { PHOTO_QUOTA_BYTES, formatPhotoBytes } from "@/lib/photos";

interface StorageUsageProps {
  usedBytes: number;
  quotaBytes?: number;
}

export function StorageUsage({
  usedBytes,
  quotaBytes = PHOTO_QUOTA_BYTES,
}: StorageUsageProps) {
  const availableBytes = Math.max(0, quotaBytes - usedBytes);
  const percent =
    quotaBytes > 0
      ? Math.min(100, Math.max(0, (usedBytes / quotaBytes) * 100))
      : 0;

  return (
    <section className="rounded-xl border bg-card px-5 py-4">
      <div className="flex items-baseline justify-between gap-4">
        <div>
          <h2 className="text-sm font-semibold">Album storage</h2>
          <p className="mt-1 text-xs text-muted-foreground">
            Application usage for finalized photos
          </p>
        </div>
        <p className="text-sm font-medium tabular-nums">
          {formatPhotoBytes(usedBytes)} used
        </p>
      </div>
      <div
        className="mt-4 h-2 overflow-hidden rounded-full bg-muted"
        role="progressbar"
        aria-label="Album storage used"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={Math.round(percent)}
      >
        <div
          className="h-full rounded-full bg-primary transition-[width]"
          style={{ width: `${percent}%` }}
        />
      </div>
      <div className="mt-2 flex justify-between text-xs text-muted-foreground">
        <span>{formatPhotoBytes(availableBytes)} available</span>
        <span>{formatPhotoBytes(quotaBytes)} limit</span>
      </div>
    </section>
  );
}
