"use client";
import React, { memo } from "react";

import { useNotificationStore } from "../store";

import BellButton from "./BellButton";

interface NotificationBellProps {
  className?: string;
}

const NotificationBell: React.FC<NotificationBellProps> = () => {
  const handleOpenDrawer = useNotificationStore((state) => state.openDrawer);
  const totalUnRead = useNotificationStore((state) => state.unRead);

  return <BellButton onClick={handleOpenDrawer} count={totalUnRead} />;
};
export default memo(NotificationBell);
