"use client";
import React, { createContext, use, useCallback } from "react";
import { buildPermission, Permission, ResourcePermission, Resources } from "@/constants/permission.constant";
import { PermissionActions } from "@/model/permission.model";

import ProtectRoute from "./ProtectRoute";

type PermissionContextApi = {
  permissions: Permission[];
  hasPermissions: (conditions: ResourcePermission) => boolean;
  hasPermission: (resource: Resources, action: PermissionActions) => boolean;
};

export const PermissionContext = createContext<PermissionContextApi | null>(null);

export const PermissionProvider: React.FC<{
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

  const checkOneCond = useCallback(
    (condition: ResourcePermission[number]): boolean => {
      if ("$or" in condition) {
        return condition.$or.reduce((hasPer, cond) => hasPer || checkOneCond(cond), false);
      }
      return hasOnePer(condition.resource, condition.action);
    },
    [hasOnePer],
  );

  const hasPermissions = useCallback(
    (conditions: ResourcePermission) => {
      return conditions.reduce((hasPer, cond) => hasPer && checkOneCond(cond), false);
    },
    [checkOneCond],
  );

  return (
    <PermissionContext.Provider value={{ permissions, hasPermissions, hasPermission: hasOnePer }}>
      <ProtectRoute>{children}</ProtectRoute>
    </PermissionContext.Provider>
  );
};
export const usePermissions = () => {
  const context = use(PermissionContext);
  if (!context) {
    throw new Error(`usePermissions must use under PermissionProvider`);
  }
  return context;
};
