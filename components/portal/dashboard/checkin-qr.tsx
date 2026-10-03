"use client";

import { QRCodeSVG } from "qrcode.react";

// Client island: `qrcode.react` touches the DOM at render, so it stays in the
// browser. The surrounding `CheckinSection` card is server-rendered.
export function CheckinQR({ value }: { value: string }) {
  return <QRCodeSVG value={value} size={180} />;
}
