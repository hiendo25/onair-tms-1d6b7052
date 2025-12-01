import UnAuthorized from "@/modules/auth-wrapper/UnAuthorized";
import { Suspense } from "react";
const AuthLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <UnAuthorized>
      <Suspense fallback={<>1231313</>}>{children}</Suspense>
    </UnAuthorized>
  );
};
export default AuthLayout;
