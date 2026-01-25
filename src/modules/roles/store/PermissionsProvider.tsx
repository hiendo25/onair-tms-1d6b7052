// "use client";
// import { IMMUTABLE_ROLES } from "@/constants/roles.constant";
// import { UserPermissions } from "@/repository/permissions";
// import React, { createContext, useContext, useMemo, useRef } from "react";

// export type PemissionCheck = {
//   resource: string;
//   action: string;
// };

// type PermissionContextValue = {
//   roles: string[];
//   permissions: Set<string>;
//   hasPermission: (resource: string, action: string) => boolean;
//   hasPermissions: (perms: PemissionCheck[]) => boolean;
//   isInRole: (role: string) => boolean;
// };

// export const PermissionContext = createContext<PermissionContextValue | null>(null);

// export function usePermissions() {
//   const ctx = useContext(PermissionContext);
//   if (!ctx) throw new Error("usePermissions must be used within PermissionProvider");
//   return ctx;
// }

// export const PermissionProvider: React.FC<{
//   children: React.ReactNode;
//   initialData: UserPermissions;
// }> = ({ children, initialData }) => {
//   const roles = useRef(initialData.roles).current;
//   const permissions = useRef(initialData.permissions).current;

//   const hasPermission = (resource: string, action: string) => {
//     if (roles.includes(IMMUTABLE_ROLES.SUPER_ADMIN)) return true;
//     return permissions.has(`${resource}:${action}`);
//   };

//   const hasPermissions = (perms: PemissionCheck[]) => {
//     if (roles.includes(IMMUTABLE_ROLES.SUPER_ADMIN)) return true;
//     if (perms.length === 0) return true;
//     return perms.every((perm) => hasPermission(perm.resource, perm.action));
//   };

//   const isInRole = (role: string) => roles.some((r) => r === role);

//   const value = useMemo<PermissionContextValue>(
//     () => ({
//       roles,
//       permissions,
//       hasPermission,
//       hasPermissions,
//       isInRole,
//     }),
//     [roles, permissions],
//   );

//   return <PermissionContext.Provider value={value}>{children}</PermissionContext.Provider>;
// };
