"use client";
import React, { createContext, PropsWithChildren, useEffect } from "react";

import { supabase } from "@/services";

import { NotificationStore } from "./NotificationStore";

const NotificationContext = createContext<NotificationStore | undefined>(undefined);

interface NotificationProviderProps extends PropsWithChildren {}
const NotificationProvider: React.FC<NotificationProviderProps> = ({ children }) => {
  useEffect(() => {
    const channel = supabase
      .channel("notifications")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "notifications",
          // filter: `user_id=eq.${userId}`,
        },
        () => {
          // queryClient.invalidateQueries(["notifications"]);
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  return (
    <NotificationContext.Provider value={{ messages: [], markRead() {} }}>{children}</NotificationContext.Provider>
  );
};
export default NotificationProvider;
