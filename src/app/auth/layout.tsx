import React, { Suspense } from "react";

import UnAuthorized from "@/modules/auth-wrapper/UnAuthorized";
const AuthLayout = ({ children }: { children: React.ReactNode }) => {
  return <UnAuthorized>{children}</UnAuthorized>;
};
export default AuthLayout;
