import { CountdownTimer } from "@/components/portal/dashboard/countdown-timer";

interface HeroSectionProps {
  startTime: string | Date;
  endTime: string | Date;
}

// Server Component: title/dates are static config. The ticking countdown is
// a `CountdownTimer` client island (renders null until hydrated).
export function HeroSection({ startTime, endTime }: HeroSectionProps) {
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
      <CountdownTimer target={endTime} />

      <div className="flex flex-wrap items-center justify-center gap-2 text-xs text-muted-foreground">
        <span>Start: {formatDate(startTime)}</span>
        <span className="hidden sm:inline">•</span>
        <span>End: {formatDate(endTime)}</span>
      </div>
    </div>
  );
}
