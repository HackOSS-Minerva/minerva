"use client";

import Image from "next/image";
import type { ReactNode } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

interface PhotoViewerProps {
  children: ReactNode;
  filename: string;
  url: string;
}

export function PhotoViewer({ children, filename, url }: PhotoViewerProps) {
  return (
    <Dialog>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="max-h-[92vh] max-w-6xl overflow-hidden border-white/10 bg-black p-2 text-white sm:max-w-6xl">
        <DialogTitle className="sr-only">{filename}</DialogTitle>
        <DialogDescription className="sr-only">
          Full-size event photo
        </DialogDescription>
        <div className="relative min-h-[50vh] w-full overflow-hidden rounded-md sm:min-h-[75vh]">
          <Image
            src={url}
            alt={filename}
            fill
            priority
            sizes="100vw"
            className="object-contain"
          />
        </div>
      </DialogContent>
    </Dialog>
  );
}
