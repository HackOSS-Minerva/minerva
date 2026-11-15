"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { RiDownloadLine } from "@remixicon/react";
import { toast } from "sonner";

interface DownloadCertificateButtonProps {
  judgeName: string;
  tenantName: string;
  organization: string;
  certificateId: string;
  eventDate: string;
}

// Client island: `html2pdf` + iframe rendering + toast are browser-only.
// Receives all display values as props from the server `CertificatePage`.export const DownloadCertificateButton = ({
  judgeName,
  tenantName,
  organization,
  certificateId,
  eventDate,
}: DownloadCertificateButtonProps) => {

} body { font-family:Georgia,serif; background:#fff; }</style>
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

      const certElement = iframe.contentDocument!.getElementById("cert") as HTMLElement;

      // html2canvas can't parse Tailwind v4's oklch()/lab() colors — intercept
      // getComputedStyle and replace any unsupported color values with a safe fallback
      const origGetComputedStyle = window.getComputedStyle;
      window.getComputedStyle = (element, pseudoElt) => {
        const styles = origGetComputedStyle.call(window, element, pseudoElt);
        return new Proxy(styles, {
          get(target, prop) {
            const val: unknown = Reflect.get(target, prop);
            if (typeof val === "string" && (val.includes("lab(") || val.includes("oklch("))) {
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
        window.getComputedStyle = origGetComputedStyle;
      }

      document.body.removeChild(iframe);
      toast.success("Certificate downloaded as PDF!");
    } finally {
      setDownloading(false);
    }
  };

  return (
    <Button onClick={handleDownload} className="w-full" disabled={downloading}>
      <RiDownloadLine className="mr-2 h-4 w-4" />
      {downloading ? "Preparing PDF…" : "Download Certificate"}
    </Button>
  );
}
