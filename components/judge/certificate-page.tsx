import { getTenant, type TenantSlug } from "@/hooks/get-tenant";
import { randomUUID } from "crypto";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { DownloadCertificateButton } from "@/components/judge/download-certificate-button";
import { JudgeBreadcrumb } from "@/components/judge/judge-breadcrumb";

interface CertificatePageProps {
  tenant: TenantSlug;
}

// Server Component: the cert preview is static markup. The random ID is
// generated server-side per request; only the pdf download stays client.
export function CertificatePage({ tenant }: CertificatePageProps) {
  const { config: tenantConfig } = getTenant(tenant);
  const live = tenantConfig?.event ?? null;

  const judgeName = "Alex J. Morgan";

  const certificateId =
    "CERT-" + randomUUID().replace(/-/g, "").slice(0, 8).toUpperCase();

  const eventDate = live?.endTime
    ? new Date(live.endTime).toLocaleDateString("en-US")
    : new Date().toLocaleDateString("en-US");

  const tenantName = tenantConfig?.name || "the event";
  const organization = `${tenantName} Organizing Committee`;

  return (
    <div className="space-y-6">
      <JudgeBreadcrumb tenant={tenant} page="Certificate" section="Participate" />

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
            <DownloadCertificateButton
              judgeName={judgeName}
              tenantName={tenantName}
              organization={organization}
              certificateId={certificateId}
              eventDate={eventDate}
            />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
