"use client";

import { useMemo } from "react";
import { useTenant } from "./use-tenant";

export interface UseFormLockOptions {
  /**
   * Form slug, e.g. "participant", "judge", "submission", "feedback"
   */
  form: string;
}

export interface UseFormLockResult {
  /**
   * Whether the form is currently locked (before opens or after closes).
   */
  isLocked: boolean;
  /**
   * ISO open time for this form.
   */
  opensAt: string | null;
  /**
   * ISO close time for this form.
   */
  closesAt: string | null;
  /**
   * Milliseconds until the form opens. Null if already open or if no open time.
   */
  opensIn: number | null;
  /**
   * Milliseconds until the form closes. Null if already closed or if no close time.
   */
  closesIn: number | null;
  /**
   * Human-readable label for the open time.
   */
  opensLabel: string | null;
  /**
   * Human-readable label for the close time.
   */
  closesLabel: string | null;
}

const SERIES_TO_MS: Record<string, number> = {
  ms: 1,
  s: 1000,
  m: 60_000,
  h: 3_600_000,
  d: 86_400_000,
} as const;

function parseDurationToMs(raw: string | undefined | null): number | undefined {
  if (!raw) return undefined;
  const trimmed = raw.trim();
  const match = /^(\d+)(ms|s|m|h|d)$/i.exec(trimmed);
  if (!match) return undefined;
  const value = Number(match[1]);
  const unit = match[2].toLowerCase();
  const multiplier = SERIES_TO_MS[unit];
  if (!multiplier || value <= 0) return undefined;
  return value * multiplier;
}

export function useFormLock({ form }: UseFormLockOptions): UseFormLockResult {
  const { live, tenant } = useTenant();

  // Get form-specific lock from formLocks config
  const formLock = tenant?.formLocks?.[form];

  const endTime = live?.endTime ?? null;
  const rawOpenOffset = live?.openOffset ?? null;

  const lock = useMemo(() => {
    // If formLocks has specific dates for this form, use them
    if (formLock?.opens && formLock?.closes) {
      return {
        opensAt: formLock.opens,
        closesAt: formLock.closes,
      };
    }

    const fallbackOpen = endTime
      ? new Date(new Date(endTime).getTime() - 24 * 60 * 60 * 1000).toISOString()
      : null;

    const opensAt =
      endTime && rawOpenOffset !== null && rawOpenOffset !== undefined
        ? new Date(new Date(endTime).getTime() - parseDurationToMs(String(rawOpenOffset))!).toISOString()
        : fallbackOpen;

    const closesAt = endTime ?? null;

    return {
      opensAt,
      closesAt,
    };
  }, [endTime, rawOpenOffset, formLock]);

  const now = useMemo(() => Date.now(), []);

  const opensIn = useMemo(() => {
    if (!lock.opensAt) return null;
    return Math.max(0, new Date(lock.opensAt).getTime() - now);
  }, [lock.opensAt]);

  const closesIn = useMemo(() => {
    if (!lock.closesAt) return null;
    return Math.max(0, new Date(lock.closesAt).getTime() - now);
  }, [lock.closesAt]);

  const isLocked = useMemo(() => {
    if (!lock.opensAt || !lock.closesAt) return false;
    const openMs = new Date(lock.opensAt).getTime();
    const closeMs = new Date(lock.closesAt).getTime();
    return now < openMs || now > closeMs;
  }, [lock, now]);

  const opensLabel = useMemo(() => {
    if (!lock.opensAt) return null;
    return new Date(lock.opensAt).toLocaleString("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      timeZoneName: "short",
    });
  }, [lock.opensAt]);

  const closesLabel = useMemo(() => {
    if (!lock.closesAt) return null;
    return new Date(lock.closesAt).toLocaleString("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      timeZoneName: "short",
    });
  }, [lock.closesAt]);

  return {
    isLocked,
    opensAt: lock.opensAt,
    closesAt: lock.closesAt,
    opensIn,
    closesIn,
    opensLabel,
    closesLabel,
  };
}
