"use client";

import { useMemo, useState } from "react";
import { useParams } from "next/navigation";
import { getTenant, type TenantSlug } from "./get-tenant";

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

export function useFormLock({ form }: UseFormLockOptions): UseFormLockResult {
  const { tenant } = useParams<{ tenant: TenantSlug }>();
  const { config } = getTenant(tenant);

  const lock = useMemo(() => {
    // DesignVerse currently has formLocks metadata for future scheduling, but
    // development/testing intentionally remains unlocked because it has no
    // legacy locks map. Only the active locks map is enforced here.
    if (!config?.locks) {
      return { opensAt: null, closesAt: null };
    }

    // Resolve the lock entry from the nested locks structure
    let lockEntry: string[] | undefined;

    // Forms are stored in locks.forms (participant, judge, speaker, superadmin, volunteer, submission, feedback)
    const formsCategory = config.locks.forms;
    if (
      formsCategory &&
      typeof formsCategory === "object" &&
      !Array.isArray(formsCategory)
    ) {
      lockEntry = (formsCategory as Record<string, string[]>)[form];
    }

    // Other categories are stored at the top level (judge, live)
    if (!lockEntry) {
      lockEntry = config.locks[form] as string[] | undefined;
    }

    if (lockEntry && Array.isArray(lockEntry) && lockEntry.length >= 2) {
      return {
        opensAt: lockEntry[0],
        closesAt: lockEntry[1],
      };
    }

    return { opensAt: null, closesAt: null };
  }, [config?.locks, form]);

  const [now] = useState(Date.now);

  const opensIn = useMemo(() => {
    if (!lock.opensAt) return null;
    return Math.max(0, new Date(lock.opensAt).getTime() - now);
  }, [lock.opensAt, now]);

  const closesIn = useMemo(() => {
    if (!lock.closesAt) return null;
    return Math.max(0, new Date(lock.closesAt).getTime() - now);
  }, [lock.closesAt, now]);

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
