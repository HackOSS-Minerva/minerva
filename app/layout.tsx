import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Toaster } from "@/components/ui/sonner";
import { Providers } from "@/lib/providers";
import { getToken } from "@/lib/auth-server";
import { LayoutProps } from "@/types/layouts";
import ConfettiOverlay from "@/components/confetti/confetti-overlay";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Minerva",
  description: "Minerva",
};

export default async function RootLayout({ children }: LayoutProps) {
  // Read the Better Auth session token server-side so authenticated Convex
  // queries can be preloaded during SSR.
  const initialToken = await getToken();
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <Providers initialToken={initialToken}>
          {children}
          <Toaster />
          <ConfettiOverlay />
        </Providers>
      </body>
    </html>
  );
}
