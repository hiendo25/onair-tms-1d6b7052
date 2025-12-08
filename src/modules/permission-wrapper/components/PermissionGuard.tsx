"use client";
import React, { memo, PropsWithChildren, useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";

import { PATHS } from "@/constants/path.contstants";
import { PATHS_WITH_PERMISSIONS } from "@/constants/path-with-permissions";
import { usePermissions } from "../store/permission-context";

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
