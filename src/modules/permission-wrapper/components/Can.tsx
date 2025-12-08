"use client";
import React, { memo } from "react";

import { PermissionsCheck } from "@/constants/permission.constant";
import { usePermissions } from "../store/permission-context";

interface CanProps {
  children: React.ReactNode;
  pers: PermissionsCheck;
}
const Can: React.FC<CanProps> = ({ children, pers }) => {
  const { hasPermissions } = usePermissions();
  const hasPer = hasPermissions(pers);

  return hasPer ? children : null;
};
export default memo(Can);
