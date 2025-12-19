"use client";
import React, { useCallback, useMemo } from "react";

import { buildPermission, Resources, ResourcesActions } from "@/constants/permission.constant";
import { Permissions, PermissionsCheck } from "@/constants/permission.constant";
import { PermissionActions } from "@/model/permission.model";
import PermissionGuard from "../components/PermissionGuard";

import { PermissionContext } from "./permission-context";

export const PermissionProvider: React.FC<{
  children: React.ReactNode;
  permissions: Permissions[];
  roles: string[];
}> = ({ children, permissions, roles }) => {
  const isSuperAdmin = roles.some((role) => role === "super_admin");
  const persMap = useMemo(() => new Map(permissions.map((per) => [per, per])), [permissions]);

  const hasOnePer = useCallback(
    (resource: Resources, action: PermissionActions) => {
      const perAction = buildPermission(resource, action);
      return persMap.has(perAction);
    },
    [persMap],
  );

  const checkOneCond = useCallback(
    (condition: ResourcesActions[number]): boolean => {
      if ("$or" in condition) {
        return condition.$or.reduce((hasPer, cond) => hasPer || checkOneCond(cond), false);
      }
      return hasOnePer(condition.resource, condition.action);
    },
    [hasOnePer],
  );

  const hasResources = useCallback(
    (conditions: ResourcesActions) => {
      if (isSuperAdmin) return true;
      return conditions.reduce((hasPer, cond) => hasPer && checkOneCond(cond), false);
    },
    [checkOneCond, isSuperAdmin],
  );

  const hasPermissions = useCallback(
    (persCheck: PermissionsCheck) => {
      if (isSuperAdmin) return true;
      return persCheck.reduce((hasPer, per) => {
        if (typeof per === "object" && "$or" in per) {
          return hasPer || persMap.has(per.$or);
        }
        return hasPer && persMap.has(per);
      }, false);
    },
    [isSuperAdmin, persMap],
  );

  return (
    <PermissionContext.Provider value={{ permissions, hasPermissions, hasResources }}>
      <PermissionGuard>{children}</PermissionGuard>
    </PermissionContext.Provider>
  );
};
