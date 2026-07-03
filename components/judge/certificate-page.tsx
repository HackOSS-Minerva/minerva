"use client"

import { useTenant } from "@/hooks/use-tenant";
import { JudgeNav } from "@/components/judge/judge-nav";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Mail, Download } from "lucide-react";
import { toast } from "sonner";

interface CertificatePageProps {
  tenant: string;
}

export function CertificatePage({ tenant }: CertificatePageProps) {
  const { tenant: tenantConfig } = useTenant();

  const judgeName = "Alex J. Morgan";

  const certificateId = "CERT-" + Math.random().toString(36).substring(2, 10).toUpperCase();

  const handleEmail = () => {
    const tenantName = tenantConfig?.name || "DesignVerse 2026";
    const subject = encodeURIComponent(`Judge Certificate - ${judgeName} - ${tenantName}`);
    const body = encodeURIComponent(
      `Hello,\n\nPlease find attached my Judge Certificate of Service for ${tenantName}.\n\nName: ${judgeName}\nRole: Judge\n\nBest regards,\n${judgeName}`,
    );
    window.location.href = `mailto:?subject=${subject}&body=${body}`;
    toast.success("Email client opened.");
  };

  const handleDownload = () => {
    const tenantName = tenantConfig?.name || "DesignVerse 2026";
    const organization = "DesignVerse Organizing Committee";
    const role = "Judge";

    const htmlContent =
      "<!DOCTYPE html>" +
      "<html lang=\"en\">" +
      "<head>" +
      "  <meta charset=\"UTF-8\" />" +
      "  <meta name=\"viewport\" content=\"width=device-width, initial-scale=1.0\" />" +
      "  <title>Certificate of Service</title>" +
      "  <style>" +
      "    * { margin: 0; padding: 0; box-sizing: border-box; }" +
      "    body { font-family: Georgia, serif; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); min-height: 100vh; display: flex; align-items: center; justify-content: center; padding: 2rem; }" +
      "    .certificate { background: #fff; padding: 3rem; max-width: 800px; width: 100%; text-align: center; border: 8px double #1a365d; box-shadow: 0 20px 60px rgba(0,0,0,0.3); }" +
      "    .header { font-size: 0.9rem; text-transform: uppercase; letter-spacing: 0.2em; color: #64748b; margin-bottom: 1rem; }" +
      "    h1 { font-size: 3rem; color: #1e3a8a; margin-bottom: 1.5rem; font-family: Georgia, serif; font-style: italic; }" +
      "    .subtitle { font-size: 1.25rem; color: #374151; margin-bottom: 2rem; }" +
      "    .recipient { font-size: 2.5rem; font-weight: bold; color: #0f172a; margin: 1rem 0; border-bottom: 2px solid #d1d5db; display: inline-block; padding: 0.5rem 3rem; }" +
      "    .body_text { font-size: 1.1rem; color: #374151; line-height: 1.8; margin: 2rem 0; max-width: 600px; margin-left: auto; margin-right: auto; }" +
      "    .details { display: flex; justify-content: space-around; margin: 2rem 0; text-align: center; }" +
      "    .detail_item { display: flex; flex-direction: column; }" +
      "    .detail_label { font-size: 0.8rem; text-transform: uppercase; color: #94a3b8; letter-spacing: 0.1em; margin-bottom: 0.25rem; }" +
      "    .detail_value { font-size: 1rem; color: #0f172a; font-weight: 600; }" +
      "    .signature { display: flex; justify-content: space-around; margin-top: 3rem; text-align: center; }" +
      "    .signature_block { text-align: center; }" +
      "    .signature_line { width: 200px; border-bottom: 1px solid #374151; margin-bottom: 0.5rem; padding-bottom: 0.5rem; }" +
      "    .signature_role { font-size: 0.85rem; color: #64748b; }" +
      "    .seal { width: 120px; height: 120px; border-radius: 50%; background: linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%); display: flex; align-items: center; justify-content: center; margin: 2rem auto 0; font-size: 3rem; color: white; box-shadow: 0 4px 6px rgba(0,0,0,0.1); }" +
      "  </style>" +
      "</head>" +
      "<body>" +
      "  <div class=\"certificate\">" +
      "    <div class=\"header\">Certificate of Service</div>" +
      "    <h1>Certificate</h1>" +
      "    <div class=\"subtitle\">Proudly presented to</div>" +
      "    <div class=\"recipient\">" + judgeName + "</div>" +
      "    <div class=\"body_text\">In recognition of your valuable service and dedication as a Judge at <strong>" + tenantName + "</strong>.</div>" +
      "    <div class=\"details\">" +
      "      <div class=\"detail_item\">" +
      "        <div class=\"detail_label\">Certificate ID</div>" +
      "        <div class=\"detail_value\">" + certificateId + "</div>" +
      "      </div>" +
      "      <div class=\"detail_item\">" +
      "        <div class=\"detail_label\">Date Issued</div>" +
      "        <div class=\"detail_value\">" + new Date().toLocaleDateString() + "</div>" +
      "      </div>" +
      "    </div>" +
      "    <div class=\"signature\">" +
      "      <div class=\"signature_block\">" +
      "        <div class=\"signature_line\"></div>" +
      "        <div class=\"signature_role\">Event Director</div>" +
      "      </div>" +
      "      <div class=\"signature_block\">" +
      "        <div class=\"signature_line\"></div>" +
      "        <div class=\"signature_role\">" + organization + "</div>" +
      "      </div>" +
      "    </div>" +
      "    <div class=\"seal\">★</div>" +
      "  </div>" +
      "</body>" +
      "</html>";

    const blob = new Blob([htmlContent], { type: "text/html" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "certificate-" + judgeName.toLowerCase().replace(/\s+/g, "-") + ".html";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast.success("Certificate downloaded successfully!");
  };

  return (
    <div className="mx-auto max-w-4xl space-y-6 px-4 py-6 md:py-10">
      <JudgeNav tenant={tenant} />

      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-bold">Judge Certificate</h1>
        <p className="text-sm text-muted-foreground">
          Download your certificate of service as a judge.
        </p>
      </div>

      <Separator className="my-6" />

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Certificate Preview</CardTitle>
            <CardDescription>
              This is a preview of your certificate. Use the download button to save it.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="border border-dashed rounded-lg p-6 text-center bg-gradient-to-br from-blue-50 to-indigo-50">
              <div className="text-xs uppercase tracking-widest text-slate-500 mb-2">
                Certificate of Service
              </div>
              <div className="text-xl font-serif italic text-indigo-900 mb-4">
                Certificate
              </div>
              <div className="text-sm text-slate-600 mb-2">
                This certificate is proudly presented to
              </div>
              <div className="text-2xl font-bold text-slate-900 border-b-2 border-slate-300 inline-block px-8 py-1 mb-4">
                {judgeName}
              </div>
              <div className="text-sm text-slate-600 leading-relaxed max-w-md mx-auto">
                In recognition of your valuable service and dedication as a Judge at{' '}
                <strong>{tenantConfig?.name || "DesignVerse 2026"}</strong>.
              </div>
              <div className="mt-6 text-xs text-slate-500">
                Certificate ID: {certificateId}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Actions</CardTitle>
            <CardDescription>
              Download or print your certificate.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Your certificate is ready for download. You can save it as an HTML file
              and open it in any browser to print or save as PDF.
            </p>
            <Button onClick={handleDownload} className="w-full">
              <Download className="mr-2 h-4 w-4" />
              Download Certificate
            </Button>
            <Button onClick={handleEmail} variant="outline" className="w-full">
              <Mail className="mr-2 h-4 w-4" />
              Email Certificate
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
