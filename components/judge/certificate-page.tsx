"use client";

import { useTenant } from "@/hooks/use-tenant";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Download } from "lucide-react";
import { toast } from "sonner";
import { useEffect, useState } from "react";
import { JudgeBreadcrumb } from "@/components/judge/judge-breadcrumb";

interface CertificatePageProps {
  tenant: string;
}

export function CertificatePage({}: CertificatePageProps) {
  const { tenant: tenantConfig, live } = useTenant();

  const judgeName = "Alex J. Morgan";

  const [certificateId, setCertificateId] = useState("");
  useEffect(() => {
    setCertificateId(
      "CERT-" + Math.random().toString(36).substring(2, 10).toUpperCase(),
    );
  }, []);

  const eventDate = live?.endTime
    ? new Date(live.endTime).toLocaleDateString("en-US")
    : new Date().toLocaleDateString("en-US");

  const tenantName = tenantConfig?.name || "DesignVerse 2026";
  const organization = "DesignVerse Organizing Committee";

  const handleDownload = async () => {
    const html2pdf = (await import("html2pdf.js")).default;

    const sealSvg =
      "<svg width='120' height='125' viewBox='0 0 180 188' fill='none' xmlns='http://www.w3.org/2000/svg'>" +
      "<path d='M42.136 87.0348L89.9927 114.665L47.8568 187.646L39.4833 146.89L9.84669e-05 160.016L42.136 87.0348Z' fill='url(#p0)'/>" +
      "<path d='M137.857 87.0348L90.0002 114.665L132.136 187.646L140.51 146.89L179.993 160.016L137.857 87.0348Z' fill='url(#p1)'/>" +
      "<circle cx='88.7979' cy='69.0752' r='69.0752' fill='url(#p2)'/>" +
      "<circle cx='89.4888' cy='69.7659' r='58.2139' fill='url(#p3)' stroke='#818181'/>" +
      "<g filter='url(#fi)'><path d='M87.5418 80.1744L69.7392 93.0318L76.7566 72.1209L58.907 59.2164H80.7599L87.5418 38.3054L94.3237 59.2164H116.177L98.327 72.1209L105.344 93.0318L87.5418 80.1744Z' fill='white'/></g>" +
      "<defs>" +
      "<filter id='fi' x='58.907' y='38.3054' width='57.2695' height='58.7264' filterUnits='userSpaceOnUse' color-interpolation-filters='sRGB'>" +
      "<feFlood flood-opacity='0' result='bg'/><feBlend in='SourceGraphic' in2='bg' result='shape'/>" +
      "<feColorMatrix in='SourceAlpha' type='matrix' values='0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0' result='ha'/>" +
      "<feOffset dy='4'/><feGaussianBlur stdDeviation='2'/><feComposite in2='ha' operator='arithmetic' k2='-1' k3='1'/>" +
      "<feColorMatrix type='matrix' values='0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.25 0'/>" +
      "<feBlend in2='shape' result='effect1_innerShadow'/></filter>" +
      "<linearGradient id='p0' x1='66.0643' y1='100.85' x2='23.9285' y2='173.831' gradientUnits='userSpaceOnUse'>" +
      "<stop stop-color='#E0A63E'/><stop offset='0.5' stop-color='#FFEE7B'/><stop offset='1' stop-color='#E0A63E'/></linearGradient>" +
      "<linearGradient id='p1' x1='113.929' y1='100.85' x2='156.064' y2='173.831' gradientUnits='userSpaceOnUse'>" +
      "<stop stop-color='#E0A63E'/><stop offset='0.5' stop-color='#FFEE7B'/><stop offset='1' stop-color='#E0A63E'/></linearGradient>" +
      "<radialGradient id='p2' cx='0' cy='0' r='1' gradientUnits='userSpaceOnUse' gradientTransform='translate(112.283 41.4451) rotate(103.65) scale(99.5163)'>" +
      "<stop stop-color='#FFEE7B'/><stop offset='1' stop-color='#E0A63E'/></radialGradient>" +
      "<radialGradient id='p3' cx='0' cy='0' r='1' gradientUnits='userSpaceOnUse' gradientTransform='translate(109.452 46.2804) rotate(103.65) scale(84.5888)'>" +
      "<stop stop-color='#FFEE7B'/><stop offset='1' stop-color='#E0A63E'/></radialGradient>" +
      "</defs></svg>";

    const certHTML = `<!DOCTYPE html><html><head><meta charset="UTF-8"/>
      <style>* { margin:0; padding:0; box-sizing:border-box; } body { font-family:Georgia,serif; background:#fff; }</style>
      </head><body>
      <div id="cert" style="background:#faf8f2;border:3px solid #c9a84c;padding:8px;font-family:Georgia,serif;">
        <div style="border:1px solid #c9a84c;padding:3.5rem 4rem;text-align:center;">
          <div style="font-size:2.2rem;font-weight:bold;letter-spacing:0.08em;color:#1a1a1a;margin-bottom:1.25rem;text-transform:uppercase;">Certificate of Service</div>
          <div style="font-size:1rem;color:#555;margin-bottom:0.75rem;">Proudly presented to</div>
          <div style="font-size:2.8rem;font-style:italic;color:#1a1a1a;margin:0.25rem 0 0;display:block;">${judgeName}</div>
          <hr style="width:70%;border:none;border-top:1px solid #aaa;margin:0.75rem auto 1.75rem;"/>
          <div style="font-size:1rem;color:#333;line-height:1.9;margin:0 auto 2rem;max-width:580px;">In recognition of your valuable service and dedication as a Judge at <strong>${tenantName}</strong>.</div>
          <div style="display:flex;justify-content:space-between;align-items:center;margin:0 auto 2rem;max-width:640px;">
            <div style="flex:1;text-align:center;">
              <div style="font-size:0.8rem;color:#888;margin-bottom:0.4rem;">Certificate ID</div>
              <div style="font-size:1rem;font-weight:bold;color:#1a1a1a;">${certificateId}</div>
            </div>
            <div style="flex:0 0 auto;display:flex;justify-content:center;padding:0 1rem;">${sealSvg}</div>
            <div style="flex:1;text-align:center;">
              <div style="font-size:0.8rem;color:#888;margin-bottom:0.4rem;">Date Issued</div>
              <div style="font-size:1rem;font-weight:bold;color:#1a1a1a;">${eventDate}</div>
            </div>
          </div>
          <div style="display:flex;justify-content:space-around;">
            <div style="text-align:center;min-width:180px;">
              <div style="border-top:1px solid #999;padding-top:0.5rem;"></div>
              <div style="font-size:0.85rem;color:#666;">Event Director</div>
            </div>
            <div style="text-align:center;min-width:180px;">
              <div style="border-top:1px solid #999;padding-top:0.5rem;"></div>
              <div style="font-size:0.85rem;color:#666;">${organization}</div>
            </div>
          </div>
        </div>
      </div>
      </body></html>`;

    const iframe = document.createElement("iframe");
    iframe.style.cssText =
      "position:absolute;left:-9999px;top:0;width:297mm;height:210mm;border:0;";
    document.body.appendChild(iframe);

    await new Promise<void>((resolve) => {
      iframe.onload = () => resolve();
      iframe.srcdoc = certHTML;
    });

    const certElement = iframe.contentDocument!.getElementById(
      "cert",
    ) as HTMLElement;

    // html2canvas can't parse Tailwind v4's oklch()/lab() colors — intercept
    // getComputedStyle and replace any unsupported color values with a safe fallback
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const origGetComputedStyle = window.getComputedStyle;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (window as any).getComputedStyle = function (...args: any[]) {
      const styles = origGetComputedStyle.apply(
        window,
        args as [Element, string?],
      );
      return new Proxy(styles, {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        get(target, prop) {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const val = (target as any)[prop];
          if (
            typeof val === "string" &&
            (val.includes("lab(") || val.includes("oklch("))
          ) {
            return "rgba(0,0,0,0)";
          }
          if (typeof val === "function") return val.bind(target);
          return val;
        },
      });
    };

    try {
      await html2pdf()
        .set({
          margin: 10,
          filename: `certificate-${judgeName.toLowerCase().replace(/\s+/g, "-")}.pdf`,
          image: { type: "jpeg", quality: 0.98 },
          html2canvas: { scale: 2, useCORS: true, logging: false },
          jsPDF: { unit: "mm", format: "a4", orientation: "landscape" },
        })
        .from(certElement)
        .save();
    } finally {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (window as any).getComputedStyle = origGetComputedStyle;
    }

    document.body.removeChild(iframe);
    toast.success("Certificate downloaded as PDF!");
  };

  return (
    <div className="space-y-6">
      <JudgeBreadcrumb />

      <div className="grid gap-6 md:grid-cols-1">
        <Card>
          <CardHeader>
            <CardTitle>Certificate Preview</CardTitle>
            <CardDescription>
              This is a preview of your certificate. Use the download button to
              save it.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {/* preview certificate styling */}
            <div className="rounded-lg p-2 flex items-center justify-center">
              <div className="bg-[#faf8f2] w-5/8 text-center border-2 border-[#c9a84c] relative p-6 shadow font-serif">
                <div className="absolute inset-2 border border-[#c9a84c] pointer-events-none" />
                {/* Title */}
                <div className="text-sm font-bold uppercase tracking-widest text-slate-900 mb-2">
                  Certificate of Service
                </div>
                {/* Subtitle */}
                <div className="text-xs text-slate-500 mb-1">
                  Proudly presented to
                </div>
                {/* Recipient */}
                <div className="text-2xl italic text-slate-900 mb-0.5">
                  {judgeName}
                </div>
                <hr className="w-2/3 mx-auto border-slate-300 mb-3" />
                {/* Body */}
                <div className="text-xs text-slate-600 leading-relaxed max-w-sm mx-auto mb-4">
                  In recognition of your valuable service and dedication as a
                  Judge at <strong>{tenantName}</strong>.
                </div>
                {/* Details row: ID — Seal — Date */}
                <div className="flex justify-between items-center max-w-xs mx-auto mb-4">
                  <div className="flex flex-col items-center gap-0.5 flex-1">
                    <span className="text-[0.55rem] text-slate-400">
                      Certificate ID
                    </span>
                    <span className="text-xs font-bold text-slate-900">
                      {certificateId}
                    </span>
                  </div>
                  <img
                    src="/newSeal.svg"
                    className="w-14 flex-shrink-0"
                    alt="seal"
                  />
                  <div className="flex flex-col items-center gap-0.5 flex-1">
                    <span className="text-[0.55rem] text-slate-400">
                      Date Issued
                    </span>
                    <span className="text-xs font-bold text-slate-900">
                      {eventDate}
                    </span>
                  </div>
                </div>
                {/* Signatures */}
                <div className="flex justify-around">
                  <div className="flex flex-col items-center gap-1">
                    <div className="w-24 border-t border-slate-400 pt-1" />
                    <span className="text-[0.6rem] text-slate-500">
                      Event Director
                    </span>
                  </div>
                  <div className="flex flex-col items-center gap-1">
                    <div className="w-24 border-t border-slate-400 pt-1" />
                    <span className="text-[0.6rem] text-slate-500 text-center max-w-[80px]">
                      {organization}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
          <CardHeader>
            <CardTitle>Actions</CardTitle>
            <CardDescription>
              Download or print your certificate.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Your certificate is ready for download as a PDF.
            </p>
            <Button onClick={handleDownload} className="w-full">
              <Download className="mr-2 h-4 w-4" />
              Download Certificate
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
