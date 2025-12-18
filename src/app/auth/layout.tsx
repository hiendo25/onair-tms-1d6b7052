import React, { Suspense } from "react";

import UnAuthorized from "@/modules/auth-wrapper/UnAuthorized";
const AuthLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <UnAuthorized>
      <Suspense fallback={<>1231313</>}>{children}</Suspense>
    </UnAuthorized>
  );
};
export default AuthLayout;
