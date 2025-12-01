"use client";
import React, { createContext, use } from "react";
import { Permissions, ResourcesActions } from "@/constants/permission.constant";

import { PermissionsCheck } from "@/constants/permission.constant";

type PermissionContextApi = {
  permissions: Permissions[];
  hasPermissions: (persCheck: PermissionsCheck) => boolean;
  hasResources: (conditions: ResourcesActions) => boolean;
};

export const PermissionContext = createContext<PermissionContextApi | null>(null);

export const usePermissions = () => {
  const context = use(PermissionContext);
  if (!context) {
    throw new Error(`usePermissions must use under PermissionProvider`);
  }
  return context;
};
