import { IconCheck, IconCopy } from "@tabler/icons-react";
import { Button } from "../ui/button";
import type { ComponentType, ReactNode } from "react";

const DetailRow = ({
  icon: Icon,
  label,
  value,
  copyable = false,
  onCopy,
  copied = false,
}: {
  icon: ComponentType<{ className?: string }>;
  label: string;
  value: ReactNode;
  copyable?: boolean;
  onCopy?: () => void;
  copied?: boolean;
}) => {
  return (
    <div className="flex items-center gap-3 rounded-lg border border-border/60 p-3">
      <div className="mt-0.5 rounded-md bg-muted p-2 text-muted-foreground">
        <Icon className="h-4 w-4" />
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
          {label}
        </p>
        <div className="wrap-break-words text-sm text-foreground">{value}</div>
      </div>
      {copyable && onCopy ? (
        <Button
          size="sm"
          variant="ghost"
          className="h-5 w-5 shrink-0 p-0"
          onClick={onCopy}
        >
          {copied ? (
            <IconCheck className="h-4 w-4" />
          ) : (
            <IconCopy className="h-4 w-4" />
          )}
        </Button>
      ) : null}
    </div>
  );
};

export default DetailRow;
