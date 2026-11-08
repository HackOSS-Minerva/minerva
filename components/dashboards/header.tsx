"use client";
import { RiLink, RiCheckLine } from "@remixicon/react";
import { Separator } from "@/components/ui/separator";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { toast } from "sonner";
import { useState } from "react";

export function SiteHeader({ children }: { children?: React.ReactNode }) {
  const [copied, setCopied] = useState(false);

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      toast.success("URL copied to clipboard");
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error("Failed to copy URL");
    }
  };

  return (
    <header className="flex h-header-height shrink-0 items-center gap-2 border-b transition-width-height ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-header-height">
      <div className="flex w-full items-center gap-1 px-4 lg:gap-2 lg:px-6">
        <SidebarTrigger className="-ml-1" size="lg" />
        <Separator orientation="vertical" className="mx-2 data-[orientation=vertical]:h-12" />
        <h1 className="text-base font-medium">{children}</h1>
        <div className="ml-auto flex items-center gap-2">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="ghost" size="icon-sm" onClick={copyToClipboard} className="relative">
                {copied ? (
                  <RiCheckLine className="size-5 text-green-600 dark:text-green-400" />
                ) : (
                  <RiLink className="size-5" />
                )}
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Copy link</p>
            </TooltipContent>
          </Tooltip>
        </div>
      </div>
    </header>
  );
}
