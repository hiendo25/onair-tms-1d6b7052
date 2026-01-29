import React from "react";
import { redirect, RedirectType } from "next/navigation";

import { AuthProvider } from "@/modules/auth/store/AuthProvider";
import { authRepository } from "@/repository";
import { AuthData } from "../auth/types";
interface Props {
  children: React.ReactNode;
}
const Authorized: React.FC<Props> = async ({ children }) => {
  const currentUser = await authRepository.getCurrentUser();

  if (!currentUser) {
    redirect("/auth/signin", RedirectType.replace);
  }

  let userInfo: AuthData | undefined;

  if (currentUser.app_metadata.provider === "email") {
    userInfo = {
      id: currentUser.id,
      name: "",
      email: currentUser?.email || "",
      avatarUrl: "",
      accessToken: "",
    };
  }
  if (currentUser.app_metadata.provider === "google") {
    userInfo = {
      id: currentUser.user_metadata.sub,
      name: currentUser.user_metadata.name,
      email: currentUser.user_metadata.email,
      avatarUrl: currentUser.user_metadata.avatar_url,
      accessToken: currentUser.user_metadata.accessToken,
    };
  }

  if (!userInfo) {
    redirect("/auth/signin", RedirectType.replace);
  }
  return <AuthProvider data={userInfo}>{children}</AuthProvider>;
};
export default Authorized;
