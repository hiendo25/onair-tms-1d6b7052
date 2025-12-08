"use client";
import { PropsWithChildren, memo, useEffect, useState } from "react";
import { PATHS_WITH_PERMISSIONS } from "@/constants/path-with-permissions";
import { usePathname, useRouter } from "next/navigation";
import { usePermissions } from "../store/permission-context";
import { PATHS } from "@/constants/path.contstants";

type PermissionGuardProps = PropsWithChildren;
const PermissionGuard: React.FC<PermissionGuardProps> = memo(({ children }) => {
  const { hasPermissions } = usePermissions();
  const [isValidPerm, setIsValidPerm] = useState(true);
  const pathname = usePathname();

  const router = useRouter();

  // console.log({ permissonPath });
  useEffect(() => {
    const perms = PATHS_WITH_PERMISSIONS[pathname] || [];

    console.log({ perms });
    if (!perms || !perms.length) {
      setIsValidPerm(true);
      return;
    }

    if (!hasPermissions(perms)) {
      setIsValidPerm(false);
      router.push(PATHS.DASHBOARD);
    } else {
      setIsValidPerm(true);
    }
  }, [pathname]);

  return isValidPerm ? children : null;
});
export default PermissionGuard;
