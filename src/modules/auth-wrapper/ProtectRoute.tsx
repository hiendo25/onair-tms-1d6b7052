import { PATHS_WITH_PERMISSIONS } from "@/constants/path-with-permissions";

import { memo, PropsWithChildren, useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { usePermissions } from "./PermissionProvider";
import { ResourcePermission } from "@/constants/permission.constant";
import { PATHS } from "@/constants/path.contstants";

type ProtectRouteProps = PropsWithChildren;
const ProtectRoute: React.FC<ProtectRouteProps> = memo(({ children }) => {
  const { hasPermissions } = usePermissions();
  const [isValidPerm, setIsValidPerm] = useState(true);
  const pathname = usePathname();

  const router = useRouter();

  const permissonPath = getPathPermissions(pathname);
  console.log({ permissonPath });
  useEffect(() => {
    const perms = PATHS_WITH_PERMISSIONS[pathname] || [];

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
export default ProtectRoute;
/**
 * Get permissions required for a given path
 * Supports both exact match and pattern matching for dynamic routes
 */
export function getPathPermissions(pathname: string): ResourcePermission | null | undefined {
  // First try exact match
  if (pathname in PATHS_WITH_PERMISSIONS) {
    const perm = PATHS_WITH_PERMISSIONS[pathname];
    return typeof perm === "function" ? perm() : perm;
  }

  // Then try pattern matching for dynamic routes
  for (const [pattern, permissions] of Object.entries(PATHS_WITH_PERMISSIONS)) {
    if (pattern.includes(":")) {
      // Convert route pattern to regex (e.g., "/classrooms/:id/edit" -> /^\/classrooms\/[^\/]+\/edit$/)
      const regexPattern = pattern.replace(/:[^\/]+/g, "[^/]+");
      const regex = new RegExp(`^${regexPattern}$`);

      if (regex.test(pathname)) {
        return typeof permissions === "function" ? permissions() : permissions;
      }
    }
  }

  return null;
}
