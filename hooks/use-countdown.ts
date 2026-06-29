"use client";

import { useState, useEffect } from "react";

export function useCountdown(targetDate: string | Date | number | null) {
  const [timeLeft, setTimeLeft] = useState<{
    days: number;
    hours: number;
    minutes: number;
    seconds: number;
  } | null>(null);

  // Normalize to a stable primitive so object references (e.g. `new Date()`)
  // passed on every render don't retrigger the effect infinitely.
  const targetTime =
    targetDate == null ? null : new Date(targetDate).getTime();

  useEffect(() => {
    if (targetTime == null) return;

    const calculate = () => {
      const now = Date.now();
      const diff = Math.max(0, targetTime - now);

      if (diff <= 0) {
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
        return;
      }

      setTimeLeft({
        days: Math.floor(diff / (1000 * 60 * 60 * 24)),
        hours: Math.floor((diff / (1000 * 60 * 60)) % 24),
        minutes: Math.floor((diff / (1000 * 60)) % 60),
        seconds: Math.floor((diff / 1000) % 60),
      });
    };

    calculate();
    const interval = setInterval(calculate, 1000);
    return () => clearInterval(interval);
  }, [targetTime]);

  return timeLeft;
}