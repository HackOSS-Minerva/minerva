import type { Metadata } from "next";
import { Geist, Geist_Mono, Inter } from "next/font/google";
import { Toaster } from "@/components/ui/sonner";
import { Providers } from "@/lib/providers";
import { LayoutProps } from "@/types/layouts";
import { ConfettiProvider } from "@/components/confetti/confetti-overlay";
import "./globals.css";

const _inter = Inter({ subsets: ["latin"], variable: "--font-sans" });

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
  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <Providers initialToken={initialToken}>
          <ConfettiProvider>
            {children}
            <Toaster />
          </ConfettiProvider>
        </Providers>
      </body>
    </html>
  );
}
