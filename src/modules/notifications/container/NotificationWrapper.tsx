import React, { PropsWithChildren } from "react";

import NotificationProvider from "../store/NotificationProvider";

interface NotificationWrapperProps extends PropsWithChildren {}

const NotificationWrapper: React.FC<NotificationWrapperProps> = ({ children }) => {
  return <NotificationProvider>{children}</NotificationProvider>;
};
export default NotificationWrapper;
