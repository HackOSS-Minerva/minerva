"use client";

import * as React from "react";
import { QRCodeCanvas, QRCodeSVG } from "qrcode.react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

export default function QRCodeGenerator() {
  const [value, setValue] = React.useState("");
  const canvasRef = React.useRef<HTMLCanvasElement>(null);

  const handleDownload = React.useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas || !value.trim()) return;

    canvas.toBlob(
      (blob) => {
        if (!blob) {
          toast.error("Failed to generate QR code image");
          return;
        }
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = "qrcode.png";
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        toast.success("QR code downloaded");
      },
      "image/png",
      1.0,
    );
  }, [value]);

  const isEmpty = value.trim().length === 0;

  return (
    <div className="mx-auto w-full max-w-3xl space-y-6">
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-bold">QR Code Generator</h1>
        <p className="text-sm text-muted-foreground">
          Enter any text or URL to generate a QR code. Download it as a PNG
          instantly. Nothing is saved.
        </p>
      </div>

      <div className="space-y-4">
        <Input
          value={value}
          onChange={(event) => setValue(event.target.value)}
          placeholder="https://example.com or any text"
        />
      </div>

      <div className="flex flex-col items-center gap-4">
        <div className="rounded-lg border bg-white p-4">
          {isEmpty ? (
            <div className="flex h-[180px] w-[180px] items-center justify-center text-muted-foreground">
              Enter text to preview
            </div>
          ) : (
            <QRCodeSVG value={value} size={180} />
          )}
        </div>
        <Button
          onClick={handleDownload}
          disabled={isEmpty}
          className="w-full sm:w-auto"
        >
          Download PNG
        </Button>
      </div>

      <div className="hidden">
        <QRCodeCanvas
          ref={canvasRef as React.RefObject<HTMLCanvasElement>}
          value={value || " "}
          size={512}
          style={{ display: "none" }}
        />
      </div>
    </div>
  );
}
