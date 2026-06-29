"use client";

import { useState } from "react";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { IconX, IconCheck, IconCopy } from "@tabler/icons-react";
import { Mail, GraduationCap, BookOpen, Award, FileText } from "lucide-react";
import DetailRow from "@/components/dashboards/row";
import type { ResumeBookRow } from "./resume-book-columns";

export function ResumeBookSheet({
  item,
  children,
}: {
  item: ResumeBookRow;
  children: React.ReactNode;
}) {
  const [copied, setCopied] = useState(false);

  const handleCopyEmail = () => {
    navigator.clipboard.writeText(item.email);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Sheet>
      <SheetTrigger asChild>{children}</SheetTrigger>
      <SheetContent side="right" className="flex flex-col gap-0 p-0 sm:max-w-sm">
        <div className="flex items-center justify-between border-b px-6 py-4">
          <SheetHeader className="p-0">
            <SheetTitle className="text-lg">
              {item.firstname} {item.lastname}
            </SheetTitle>
          </SheetHeader>
        </div>

        <div className="flex-1 space-y-6 overflow-y-auto px-6 py-5">
          <div className="space-y-3">
            <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Contact
            </p>
            <div className="grid gap-3">
              <DetailRow
                icon={Mail}
                label="Email"
                value={item.email}
                copyable
                onCopy={handleCopyEmail}
                copied={copied}
              />
            </div>
          </div>

          <div className="space-y-3">
            <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Demographics
            </p>
            <div className="grid gap-3">
              <DetailRow icon={GraduationCap} label="School" value={item.school} />
              <DetailRow icon={Award} label="Grade" value={item.grade} />
              <DetailRow icon={BookOpen} label="Major" value={item.major} />
            </div>
          </div>

          <div className="space-y-3">
            <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Resume
            </p>
            <div className="grid gap-3">
              <DetailRow
                icon={FileText}
                label="Resume"
                value={item.resume || "Not Attached"}
              />
            </div>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
