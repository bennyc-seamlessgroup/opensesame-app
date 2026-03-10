import type { Metadata, Viewport } from "next";

import { Suspense } from "react";
import { AppTopHeader } from "@/components/app-top-header";
import { BottomTabBar } from "@/components/bottom-tab-bar";
import { AppStateProvider } from "@/lib/app-state";
import "./globals.css";

export const metadata: Metadata = {
  title: "OpenSesame Consumer App 2.1",
  description: "Food-first dining decisions, QR pay/verify, and reward-driven trust UX",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: "#FF6A00",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body className="bg-muted/40 font-sans antialiased">
        <AppStateProvider>
          <div className="min-h-screen pb-24">
            <Suspense
              fallback={
                <div className="sticky top-0 z-40 h-14 border-b border-border/70 bg-background/95 px-4 py-3 backdrop-blur supports-[backdrop-filter]:bg-background/85" />
              }
            >
              <AppTopHeader />
            </Suspense>
            <main className="mx-auto w-full max-w-[480px] px-4 py-4">{children}</main>
            <BottomTabBar />
          </div>
        </AppStateProvider>
      </body>
    </html>
  );
}
