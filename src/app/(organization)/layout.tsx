import React from "react";

import Authorized from "@/modules/auth-wrapper/Authorized";
import LayoutWraper from "@/modules/layout-wraper/LayoutWraper";
import { LibraryDialog } from "@/modules/library/components/LibraryDialog";
import { LibraryProvider } from "@/modules/library/store/libraryProvider";
import UserOrganizationWraper from "@/modules/organization/container/UserOrganizationWraper";

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <Authorized>
      <UserOrganizationWraper>
        <LayoutWraper>
          <LibraryProvider>
            {children}
            <LibraryDialog />
          </LibraryProvider>
        </LayoutWraper>
      </UserOrganizationWraper>
    </Authorized>
  );
}
