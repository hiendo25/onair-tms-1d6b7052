import React from "react";

import Authorized from "@/modules/auth-wrapper/Authorized";
import LayoutWrapper from "@/modules/layout-wrapper/container/LayoutWrapper";
import { LibraryDialog } from "@/modules/library/components/LibraryDialog";
import { LibraryProvider } from "@/modules/library/store/libraryProvider";
import OrganizationWrapper from "@/modules/organization/container/OrganizationWrapper";

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <Authorized>
      <OrganizationWrapper>
        <LayoutWrapper>
          <LibraryProvider>
            {children}
            <LibraryDialog />
          </LibraryProvider>
        </LayoutWrapper>
      </OrganizationWrapper>
    </Authorized>
  );
}
