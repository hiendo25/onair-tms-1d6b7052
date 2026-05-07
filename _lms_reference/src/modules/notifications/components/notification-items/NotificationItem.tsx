import React, { createContext, useContext } from "react";
import { Activity } from "react";
import Link from "next/link";
import { boolean } from "zod";

import LoadingIndicator from "@/shared/ui/LoadingIndicator";
import { cn } from "@/utils";

type NotificationContextApi = { isRead?: boolean; href: string | undefined };
const NotificationItemContext = createContext<NotificationContextApi | null>(null);

const useNotificationItem = () => {
  const context = useContext(NotificationItemContext);
  if (!context) throw new Error("Use inside NotificationItem.Root");
  return context;
};

const Root: React.FC<{
  data: NotificationContextApi;
  onClick: (() => void) | undefined;
  className?: string;
  children: React.ReactNode;
}> = ({ data, onClick, className, children }) => (
  <NotificationItemContext.Provider value={data}>
    <div className={cn("notification-item relative hover:bg-gray-100 p-4 rounded-lg", className)} onClick={onClick}>
      <NotificationLinkable href={data.href}>
        <div className="flex gap-4 items-start cursor-pointer">{children}</div>
      </NotificationLinkable>
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

type NotificationLinkableProps = {
  children: React.ReactElement;
  href?: string;
};

export function NotificationLinkable({ children, href }: NotificationLinkableProps): React.ReactElement {
  if (!href) return children;

  return (
    <Link href={href} prefetch={false}>
      {children}
      <LoadingIndicator className="float-right" />
    </Link>
  );
}
export const NotificationItem = {
  Root,
  Thumbnail,
  Content,
};
