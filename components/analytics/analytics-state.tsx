"use client";

import { Component, type ReactNode } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";

type AnalyticsStateProps = {
  state: "loading" | "empty" | "error";
  onRetry?: () => void;
};

export function AnalyticsState({ state, onRetry }: AnalyticsStateProps) {
  if (state === "loading") {
    return (
      <div
        aria-label="Loading analytics"
        className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4"
      >
        {Array.from({ length: 4 }, (_, index) => (
          <Card key={index}>
            <CardHeader>
              <Skeleton className="h-4 w-3/4" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-8 w-1/2" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>
          {state === "empty" ? "No event data yet" : "Analytics unavailable"}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4 text-sm text-muted-foreground">
        <p>
          {state === "empty"
            ? "Applications, check-ins, and project submissions will appear here once event activity begins."
            : "We could not load event analytics. Please try again."}
        </p>
        {state === "error" && onRetry ? (
          <Button onClick={onRetry}>Retry</Button>
        ) : null}
      </CardContent>
    </Card>
  );
}

type AnalyticsErrorBoundaryProps = { children: ReactNode };
type AnalyticsErrorBoundaryState = { hasError: boolean; retryKey: number };

export class AnalyticsErrorBoundary extends Component<
  AnalyticsErrorBoundaryProps,
  AnalyticsErrorBoundaryState
> {
  state: AnalyticsErrorBoundaryState = { hasError: false, retryKey: 0 };

  static getDerivedStateFromError(): Partial<AnalyticsErrorBoundaryState> {
    return { hasError: true };
  }

  componentDidCatch() {}

  retry = () =>
    this.setState(({ retryKey }) => ({
      hasError: false,
      retryKey: retryKey + 1,
    }));

  render() {
    if (this.state.hasError)
      return <AnalyticsState state="error" onRetry={this.retry} />;
    return <div key={this.state.retryKey}>{this.props.children}</div>;
  }
}
