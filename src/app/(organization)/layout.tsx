import React from "react";

import Authorized from "@/modules/auth-wrapper/Authorized";
import LayoutWrapper from "@/modules/layout-wrapper/container/LayoutWrapper";
import { LibraryDialog } from "@/modules/library/components/LibraryDialog";
import { LibraryProvider } from "@/modules/library/store/libraryProvider";
import UserOrganizationWrapper from "@/modules/organization/container/UserOrganizationWrapper";

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <Authorized>
      <UserOrganizationWrapper>
        <LayoutWrapper>
          <LibraryProvider>
            {children}
            <LibraryDialog />
          </LibraryProvider>
        </LayoutWrapper>
      </UserOrganizationWrapper>
    </Authorized>
  );
}
