import React, { PropsWithChildren } from "react";

import NotificationProvider from "../store/NotificationProvider";

import NotificationDrawerContainer from "./NotificationDrawerContainer";

interface NotificationWrapperProps extends PropsWithChildren {}

const NotificationWrapper: React.FC<NotificationWrapperProps> = ({ children }) => {
  return (
    <NotificationProvider>
      {children}
      <NotificationDrawerContainer />
    </NotificationProvider>
  );
};
export default NotificationWrapper;
