import Authorized from "@/modules/auth-wrapper/Authorized";
import UserOrganizationWraper from "@/modules/organization/container/UserOrganizationWraper";
import LayoutWraper from "@/modules/layout-wraper/LayoutWraper";
import { LibraryProvider } from "@/modules/library/store/libraryProvider";
import { LibraryDialog } from "@/modules/library/components/LibraryDialog";

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
