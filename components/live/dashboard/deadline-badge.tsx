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
// badge. The surrounding card + deadline text stay server-rendered.export const DeadlineBadge = ({ deadline, isPastDeadline: ssrPastDeadline }: DeadlineBadgeProps) => {
  const { timeLeft } = useCountdown(deadline);

  if (!timeLeft) return null;

  return (
    <Badge variant="secondary" className="shrink-0">
      {timeLeft.days > 0 ? `${timeLeft.days}d ` : ""}
      {timeLeft.hours}h {timeLeft.minutes}m remaining
    </Badge>
  );
}
