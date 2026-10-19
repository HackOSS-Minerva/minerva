"use client";

import { useCallback, useEffect, useRef, useState } from "react";

/** "Copied!" reset delay shared by every copy-to-clipboard button. */
export const COPY_RESET_MS = 2000;

export function useCopyWithTimeout(durationMs = COPY_RESET_MS) {
  const [copied, setCopied] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(
    () => () => {
      if (timer.current) clearTimeout(timer.current);
    },
    [],
  );

  const copy = useCallback(
    async (text: string) => {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      if (timer.current) clearTimeout(timer.current);
      timer.current = setTimeout(() => setCopied(false), durationMs);
    },
    [durationMs],
  );

  return { copied, copy } as const;
}
