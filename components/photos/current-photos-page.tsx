"use client";

import { PhotosPage } from "@/components/photos/photos-page";
import { useTenant } from "@/hooks/use-tenant";

interface CurrentPhotosPageProps {
  tenant: string;
  mode: "participant" | "admin";
}

export function CurrentPhotosPage({ tenant, mode }: CurrentPhotosPageProps) {
  const { live } = useTenant();

  if (!live) {
    return (
      <div className="rounded-xl border border-dashed p-8 text-center">
        <h1 className="text-xl font-semibold">Photos are not available</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          There is no current event album for this organization.
        </p>
      </div>
    );
  }

  return (
    <PhotosPage
      tenant={tenant}
      eventId={live.id}
      eventName={live.name}
      isLive={live.status === "live"}
      mode={mode}
    />
  );
}
