"use client";
import { memo } from "react";
import { usePermissions } from "../store/permission-context";
import { PermissionsCheck } from "@/constants/permission.constant";

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
