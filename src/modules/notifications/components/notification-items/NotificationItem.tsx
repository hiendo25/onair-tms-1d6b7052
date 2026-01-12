import React, { createContext, useContext } from "react";
import { Activity } from "react";
import { boolean } from "zod";

import { cn } from "@/utils";

type NotificationContextApi = { isRead?: boolean };
const NotificationItemContext = createContext<NotificationContextApi | null>(null);

const useNotificationItem = () => {
  const context = useContext(NotificationItemContext);
  if (!context) throw new Error("Use inside NotificationItem.Root");
  return context;
};

const Root: React.FC<{ isRead?: boolean; onClick?: () => void; className?: string; children: React.ReactNode }> = ({
  isRead,
  onClick,
  className,
  children,
}) => (
  <NotificationItemContext.Provider value={{ isRead }}>
    <div className={cn("notification-item relative", className)} onClick={onClick}>
      <div className="flex gap-4 items-start cursor-pointer">{children}</div>
    </div>
  </NotificationItemContext.Provider>
);

const UnreadDot = () => {
  const { isRead } = useNotificationItem();

  return (
    <Activity mode={isRead ? "hidden" : "visible"}>
      <div className="w-3 h-3 rounded-full bg-blue-600 absolute bottom-0 -right-1 border border-white" />
    </Activity>
  );
};

const Thumbnail: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div className="relative notification-item__thumbnail">
    <UnreadDot />
    {children}
  </div>
);

const Content: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div className="notification-item__content flex-1">{children}</div>
);

export const NotificationItem = {
  Root,
  Thumbnail,
  Content,
};
