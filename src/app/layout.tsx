"use server";
import "../theme/palette.css";
import "../theme/globals.css";
import "@/modules/class-room-management/listeners/create-classroom";

import React from "react";
import type { Metadata, ResolvingMetadata } from "next";
import { Inter } from "next/font/google";

import DialogsProvider from "@/hooks/useDialogs/DialogsProvider";
import NotificationsProvider from "@/hooks/useNotifications/NotificationsProvider";
import MUILocalizationProvider from "@/shared/providers/MUILocationProvider";
import MUIThemeProvider from "@/shared/providers/MUIThemeProvider";
import ReactQueryClientProvider from "@/shared/providers/ReactQueryClientProvider";
import SnackbarProvider from "@/shared/providers/SnackbarProvider";
const inter = Inter({
  weight: ["300", "400", "500", "600", "700", "800", "900"],
  subsets: ["latin"],
  display: "swap",
  variable: "--font-inter",
});

interface RootLayooutProps {
  params: Promise<Record<string, any>>;
  searchParams: Promise<Record<string, any>>;
}
export async function generateMetadata(
  { params, searchParams }: RootLayooutProps,
  parent: ResolvingMetadata,
): Promise<Metadata> {
  return {
    title: {
      template: "%s | ONAIR",
      default: "ONAIR", // a default is required when creating a template
    },
  };
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="vi" suppressHydrationWarning className={inter.variable}>
      <body>
        <div className="main-app">
          <ReactQueryClientProvider>
            <MUIThemeProvider>
              <MUILocalizationProvider>
                <NotificationsProvider>
                  <DialogsProvider>
                    <SnackbarProvider>{children}</SnackbarProvider>
                  </DialogsProvider>
                </NotificationsProvider>
              </MUILocalizationProvider>
            </MUIThemeProvider>
          </ReactQueryClientProvider>
        </div>
      </body>
    </html>
  );
}
