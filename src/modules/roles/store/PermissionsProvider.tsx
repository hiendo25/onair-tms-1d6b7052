"use client";
import { IMMUTABLE_ROLES } from "@/constants/roles.constant";
import { UserPermissions } from "@/repository/permissions";
import React, { createContext, useCallback, useContext, useMemo, useRef } from "react";
import { buildPermission, Permission, ResourcePermission, Resources } from "@/constants/permission.constant";
import { PermissionActions } from "@/model/permission.model";
export type PemissionCheck = {
  resource: string;
  action: string;
};

type PermissionContextValue = {
  roles: string[];
  permissions: Set<string>;
  hasPermission: (resource: string, action: string) => boolean;
  hasPermissions: (perms: PemissionCheck[]) => boolean;
  isInRole: (role: string) => boolean;
};

export const PermissionContext = createContext<PermissionContextValue | null>(null);

export function usePermissions() {
  const ctx = useContext(PermissionContext);
  if (!ctx) throw new Error("usePermissions must be used within PermissionProvider");
  return ctx;
}

export const PermissionProvider: React.FC<{
  children: React.ReactNode;
  initialData: UserPermissions;
}> = ({ children, initialData }) => {
  const roles = useRef(initialData.roles).current;
  const permissions = useRef(initialData.permissions).current;

  const hasPermission = (resource: string, action: string) => {
    if (roles.includes(IMMUTABLE_ROLES.SUPER_ADMIN)) return true;
    return permissions.has(`${resource}:${action}`);
  };

  const hasPermissions = (perms: PemissionCheck[]) => {
    if (roles.includes(IMMUTABLE_ROLES.SUPER_ADMIN)) return true;
    if (perms.length === 0) return true;
    return perms.every((perm) => hasPermission(perm.resource, perm.action));
  };

  const isInRole = (role: string) => roles.some((r) => r === role);

  const value = useMemo<PermissionContextValue>(
    () => ({
      roles,
      permissions,
      hasPermission,
      hasPermissions,
      isInRole,
    }),
    [roles, permissions],
  );

  return <PermissionContext.Provider value={value}>{children}</PermissionContext.Provider>;
};

type PermissionContextValue2 = {
  permissions: Permission[];
  hasPermissions: (condition: ResourcePermission) => boolean;
};

export const PermissionContext2 = createContext<PermissionContextValue2 | null>(null);
export const PermissionProvider2: React.FC<{
  children: React.ReactNode;
  permissions: Permission[];
}> = ({ children, permissions }) => {
  const persMap = new Map(permissions.map((per) => [per, per]));

  const hasOnePer = useCallback(
    (resource: Resources, action: PermissionActions) => {
      const perAction = buildPermission(resource, action);
      return persMap.has(perAction);
    },
    [persMap],
  );

  const checkCondition = useCallback(
    (condition: ResourcePermission): boolean => {
      return condition.every((item) => {
        if ("$or" in item) {
          // If it has $or, at least one of the nested conditions must be true
          return checkCondition(item.$or);
        }
        // Regular permission check
        return hasOnePer(item.resource, item.action);
      });
    },
    [hasOnePer],
  );

  const hasPermissions = useCallback(
    (condition: ResourcePermission) => {
      return checkCondition(condition);
    },
    [checkCondition],
  );

  return <PermissionContext2.Provider value={{ permissions, hasPermissions }}>{children}</PermissionContext2.Provider>;
};
