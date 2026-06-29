"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactNode } from "react";
import { ConvexClientProvider } from "@/lib/convex-provider";
import { ThemeProvider } from "@/lib/theme-provider";

const client = new QueryClient();

export function Providers({ children }: { children: ReactNode }) {
  return (
    <ThemeProvider>
      <ConvexClientProvider>
        <QueryClientProvider client={client}>{children}</QueryClientProvider>
      </ConvexClientProvider>
    </ThemeProvider>
  );
}
