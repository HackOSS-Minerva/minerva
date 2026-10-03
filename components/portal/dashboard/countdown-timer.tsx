"use client";

import { useCountdown } from "@/hooks/use-countdown";

interface CountdownTimerProps {
  target: string | Date | number | null;
}

// Client island: the only ticking (1s interval) part of the hero. Everything
// else in `HeroSection` is static and server-rendered.
export function CountdownTimer({ target }: CountdownTimerProps) {
  const timeLeft = useCountdown(target);

  if (!timeLeft) return null;

  return (
    <div>
      <p className="text-xs text-muted-foreground">Hacking Ends In</p>
      <div className="mt-0.5 flex items-center gap-3 md:gap-4">
        {timeLeft.days > 0 && (
          <div className="flex min-w-[3.5ch] flex-col items-center">
            <span className="text-3xl font-mono font-bold tabular-nums md:text-4xl lg:text-5xl">
              {String(timeLeft.days).padStart(2, "0")}
            </span>
            <span className="text-xs text-muted-foreground">days</span>
          </div>
        )}
        {timeLeft.days > 0 && (
          <span className="text-3xl font-mono font-bold text-muted-foreground/60 md:text-4xl lg:text-5xl">
            :
          </span>
        )}
        <div className="flex min-w-[2.5ch] flex-col items-center">
          <span className="text-3xl font-mono font-bold tabular-nums md:text-4xl lg:text-5xl">
            {String(timeLeft.hours).padStart(2, "0")}
          </span>
          <span className="text-xs text-muted-foreground">hrs</span>
        </div>
        <span className="text-3xl font-mono font-bold text-muted-foreground/60 md:text-4xl lg:text-5xl">
          :
        </span>
        <div className="flex min-w-[2.5ch] flex-col items-center">
          <span className="text-3xl font-mono font-bold tabular-nums md:text-4xl lg:text-5xl">
            {String(timeLeft.minutes).padStart(2, "0")}
          </span>
          <span className="text-xs text-muted-foreground">min</span>
        </div>
        <span className="text-3xl font-mono font-bold text-muted-foreground/60 md:text-4xl lg:text-5xl">
          :
        </span>
        <div className="flex min-w-[2.5ch] flex-col items-center">
          <span className="text-3xl font-mono font-bold tabular-nums md:text-4xl lg:text-5xl">
            {String(timeLeft.seconds).padStart(2, "0")}
          </span>
          <span className="text-xs text-muted-foreground">sec</span>
        </div>
      </div>
    </div>
  );
}
