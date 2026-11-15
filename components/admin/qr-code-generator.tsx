"use client";

import * as React from "react";
import { QRCodeSVG } from "qrcode.react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

const QRCodeGenerator = () => {
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
    <div className="w-full space-y-4 p-4">
      <h1 className="text-left text-2xl font-bold">QR Code Generator</h1>

      {/* Input and download button side by side */}
      <div className="flex gap-2">
        <Input
          value={value}
          onChange={(event) => setValue(event.target.value)}
          placeholder="https://example.com or any text"
        />
        <Button onClick={handleDownload} disabled={isEmpty} className="sm:w-auto">
          Download PNG
        </Button>
      </div>

      {/* Preview area - no border, left aligned */}
      <div>
        {isEmpty ? (
          <div
            className="flex h-48 items-center justify-center text-left text-muted-foreground"
          >
            Enter text to preview
          </div>
        ) : (
          <QRCodeSVG value={value} size={200} className="mx-auto block" />
        )}
      </div>
    </div>
  );
};

export default QRCodeGenerator;
