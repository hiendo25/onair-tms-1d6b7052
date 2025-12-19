import { redirect,RedirectType } from "next/navigation";

import { authRepository } from "@/repository";
interface UnAuthorizedProps {
  children?: React.ReactNode;
}
const UnAuthorized = async ({ children }: UnAuthorizedProps) => {
  const currentUser = await authRepository.getCurrentUser();
  if (currentUser) {
    redirect("/dashboard", RedirectType.replace);
  }
  return children;
};

export default UnAuthorized;
