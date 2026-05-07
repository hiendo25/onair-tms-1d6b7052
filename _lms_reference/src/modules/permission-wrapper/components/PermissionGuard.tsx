"use client";
import React, { memo, PropsWithChildren, useEffect, useState } from "react";
import { useEffectEvent } from "react";
import { usePathname, useRouter } from "next/navigation";
import { forbidden } from "next/navigation";

import { PATHS_WITH_PERMISSIONS } from "@/constants/path-with-permissions.constant";
import { usePermissions } from "../store/permission-context";

type PermissionGuardProps = PropsWithChildren;

const PermissionGuard: React.FC<PermissionGuardProps> = memo(({ children }) => {
  const { hasPermissions } = usePermissions();
  const [isValidPerm, setIsValidPerm] = useState(false);
  const pathname = usePathname();

  const resolvePathnameWithPermissionsPath = useEffectEvent((pathname: string) => {
    const perms = PATHS_WITH_PERMISSIONS[pathname] || [];

    /**
     * Default if not handle Path in PATHS_WITH_PERMISSIONS will bypass user.
     */
    if (!perms || !perms.length || hasPermissions(perms)) {
      setIsValidPerm(true);
      return;
    }

    setIsValidPerm(false);
    forbidden();
  });
  useEffect(() => {
    resolvePathnameWithPermissionsPath(pathname);
  }, [pathname]);

  return isValidPerm ? children : null;
});
export default PermissionGuard;
