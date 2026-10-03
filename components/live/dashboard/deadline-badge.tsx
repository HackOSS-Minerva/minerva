"use client";

import { Badge } from "@/components/ui/badge";
import { useCountdown } from "@/hooks/use-countdown";

interface DeadlineBadgeProps {
  deadline: number;
  /** SSR'd past-deadline state: used until the client countdown hydrates, so
   * first paint matches the server and no `Date.now()` runs during render. */
  isPastDeadline: boolean;
}

// Client island: renders the live "Xh Ym remaining" / "Deadline Passed"
// badge. The surrounding card + deadline text stay server-rendered.
export function DeadlineBadge({
  deadline,
  isPastDeadline: ssrPastDeadline,
}: DeadlineBadgeProps) {
  const timeLeft = useCountdown(deadline);

  // Before hydration `timeLeft` is null: fall back to the server value to
  // avoid a hydration mismatch. Afterwards the ticking countdown is truth.
  const isPastDeadline = timeLeft
    ? timeLeft.days <= 0 &&
      timeLeft.hours <= 0 &&
      timeLeft.minutes <= 0 &&
      timeLeft.seconds <= 0
    : ssrPastDeadline;

  if (isPastDeadline) {
    return <Badge variant="outline">Deadline Passed</Badge>;
  }

  if (!timeLeft) return null;

  return (
    <Badge variant="secondary" className="shrink-0">
      {timeLeft.days > 0 ? `${timeLeft.days}d ` : ""}
      {timeLeft.hours}h {timeLeft.minutes}m remaining
    </Badge>
  );
}
