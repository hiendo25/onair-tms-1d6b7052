"use server";
import React from "react";

import Authorized from "@/modules/auth-wrapper/Authorized";
import LayoutWrapper from "@/modules/layout-wrapper/container/LayoutWrapper";
import { LibraryDialog } from "@/modules/library/components/LibraryDialog";
import { LibraryProvider } from "@/modules/library/store/libraryProvider";
import NotificationWrapper from "@/modules/notifications/container/NotificationWrapper";
import PushNotificationManager from "@/modules/notifications/container/PushNotificationManager";
import OrganizationWrapper from "@/modules/organization/container/OrganizationWrapper";

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <Authorized>
      <OrganizationWrapper>
        <NotificationWrapper>
          <LayoutWrapper>
            <LibraryProvider>
              {children}
              <PushNotificationManager />
              <LibraryDialog />
            </LibraryProvider>
          </LayoutWrapper>
        </NotificationWrapper>
      </OrganizationWrapper>
    </Authorized>
  );
}
