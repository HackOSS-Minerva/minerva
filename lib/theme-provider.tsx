"use client";

import * as React from "react";
import { ThemeProvider as NextThemesProvider } from "next-themes";
import { usePathname } from "next/navigation";

const NextThemes = ({
  children,
  ...props
}: React.ComponentProps<typeof NextThemesProvider>) => {
  return <NextThemesProvider {...props}>{children}</NextThemesProvider>;
};

export const ThemeProvider = ({ children }: { children: React.ReactNode }) => {
  const pathname = usePathname();

  const tenant = pathname.split("/")[1];

  return (
    <NextThemes
      attribute="class"
      defaultTheme={tenant}
      enableSystem
      disableTransitionOnChange
    >
      {children}
    </NextThemes>
  );
};
