"use client";

import { useCountdown } from "@/hooks/use-countdown";

interface HeroSectionProps {
  startTime: string | Date;
  endTime: string | Date;
}

export function HeroSection({ startTime, endTime }: HeroSectionProps) {
  const timeLeft = useCountdown(endTime);

  const formatDate = (date: string | Date) => {
    return new Date(date).toLocaleDateString("en-US", {
      weekday: "long",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      timeZoneName: "short",
    });
  };

  return (
    <div className="flex flex-col items-center gap-2 py-2 text-center md:py-3">
      {timeLeft && (
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
      )}

      <div className="flex flex-wrap items-center justify-center gap-2 text-xs text-muted-foreground">
        <span>Start: {formatDate(startTime)}</span>
        <span className="hidden sm:inline">•</span>
        <span>End: {formatDate(endTime)}</span>
      </div>
    </div>
  );
}