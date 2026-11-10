"use client";

import { ReactNode } from "react";
import { Button } from "@/components/ui/button";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";
import { RiUserLine } from "@remixicon/react";
import { StatusBadge, normalizeApplicantStatus } from "./status-icon";
import DetailRow from "./row";
import { useCopyWithTimeout } from "@/hooks/use-copy";
import { useDrawerDirection } from "./profile-drawer";

/** Configuration for a single field inside a section. */
export type MemberFieldConfig = {
  /** Property key on the member document. */
  key: string;
  /** Display label shown next to the value. */
  label: string;
  /** Icon rendered on the left of the row. */
  icon?: React.ComponentType<{ className?: string }>;
  /** Format the value before rendering. */
  format?: (value: unknown) => string | ReactNode;
  /** Fully custom render; bypasses format and default value. */
  render?: (
    item: Record<string, unknown>,
    copyText?: (text: string) => void,
    copied?: boolean,
  ) => ReactNode;
  /** Whether this field's value is copyable. */
  copyable?: boolean;
};

/** Configuration for a labeled group of fields. */
export type MemberSectionConfig = {
  /** Section header text. */
  title: string;
  /** Optional icon rendered next to the section header. */
  icon?: React.ComponentType<{ className?: string }>;
  /** Fields rendered inside this section. */
  fields: MemberFieldConfig[];
};

/** Shared drawer shell for all member detail sheets. */
export type MemberSheetProps = {
  /** The member document (e.g. Doc<"participants">). */
  item: Record<string, unknown>;
  /** Ordered list of sections to render. */
  sections: MemberSectionConfig[];
  /** Optional custom header content (e.g. profile picture for judges/speakers). */
  header?: ReactNode;
  /** Optional footer content (e.g. close button). */
  footer?: ReactNode;
};

export function MemberSheet({ item, sections, header, footer }: MemberSheetProps) {
  const direction = useDrawerDirection();
  const { copied, copy: copyText } = useCopyWithTimeout();

  const normalizedStatus =
    item.status && typeof item.status === "string"
      ? normalizeApplicantStatus(item.status)
      : "PENDING";

  return (
    <Drawer direction={direction}>
      <DrawerTrigger asChild>
        <Button variant="link" className="text-foreground w-fit px-0 text-left">
          {String(item.firstname)} {String(item.lastname)}
        </Button>
      </DrawerTrigger>
      <DrawerContent>
        <div className="flex h-full flex-col px-4 py-5 gap-5">
          {/* Header */}
          <div className="flex items-start justify-between">
            <DrawerHeader className="gap-1 p-0 w-full items-center text-center">
              <DrawerTitle className="text-center">
                {String(item.firstname)} {String(item.lastname)}
              </DrawerTitle>
              <div className="flex items-center justify-center gap-2">
                <StatusBadge status={normalizedStatus} />
              </div>
            </DrawerHeader>
          </div>

          {header}

          {/* Sections */}
          <div className="flex flex-col gap-4 overflow-y-auto text-sm">
            {sections.map((section, idx) => (
              <div key={idx}>
                <div className="mb-2 flex items-center gap-2">
                  {section.icon && (
                    <section.icon className="h-4 w-4 shrink-0 text-muted-foreground" />
                  )}
                  <p className="text-sm font-semibold text-foreground">{section.title}</p>
                </div>
                <div className="space-y-3">
                  {section.fields.map((field, fIdx) => {
                    const rawValue = item[field.key];
                    const formattedValue = field.format ? field.format(rawValue) : rawValue;
                    const displayValue = field.render
                      ? field.render(item, copyText, copied)
                      : formattedValue;
                    return (
                      <DetailRow
                        key={fIdx}
                        icon={field.icon || RiUserLine}
                        label={field.label}
                        value={displayValue as ReactNode}
                        copyable={field.copyable}
                        onCopy={() => {
                          if (field.copyable && String(item[field.key]) === item[field.key]) {
                            copyText(item[field.key] as string);
                          }
                        }}
                        copied={copied}
                      />
                    );
                  })}
                </div>
                {idx < sections.length - 1 && <hr className="mt-4" />}
              </div>
            ))}
          </div>

          {footer}
        </div>
      </DrawerContent>
    </Drawer>
  );
}
