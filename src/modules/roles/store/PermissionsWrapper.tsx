"use server";
import { authRepository } from "@/repository";
import { getUserPermissions } from "@/repository/permissions";
import { PermissionProvider } from "./PermissionsProvider";

export default async function PermissionsWrapper({ children }: React.PropsWithChildren<{}>) {
  const user = await authRepository.getCurrentUser();
  if (!user)
    return (
      <PermissionProvider
        initialData={{
          permissions: new Set(),
          roles: [],
        }}
      >
        {children}
      </PermissionProvider>
    );
  const data = await getUserPermissions(user.id);

  return <PermissionProvider initialData={data}>{children}</PermissionProvider>;
}
