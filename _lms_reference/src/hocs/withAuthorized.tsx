// import React from "react";
// import { redirect, RedirectType } from "next/navigation";

// // import { getCurrentUser } from "@/modules/auth/actions/getCurrentUser";
// import { AuthData } from "@/modules/auth/types";
// import { useUserOrganization } from "@/modules/organization";
// export interface WithAuthorizedProps {
//   data: { userId: string };
//   children?: React.ReactNode;
// }
// const withAuthorized = (Comp: React.ElementType<WithAuthorizedProps>) => {
//   return async function WrapedComponent(props: any) {
//     // const currentUser = await getCurrentUser();

//     if (!currentUser) {
//       redirect("/auth/signin", RedirectType.replace);
//     }

//     let userInfo: AuthData | undefined;

//     if (currentUser.app_metadata.provider === "email") {
//       userInfo = {
//         id: currentUser.id,
//         name: "",
//         email: currentUser?.email || "",
//         avatarUrl: "",
//         accessToken: "",
//       };
//     }
//     if (currentUser.app_metadata.provider === "gmail") {
//       userInfo = {
//         id: currentUser.user_metadata.sub,
//         name: currentUser.user_metadata.name,
//         email: currentUser.user_metadata.email,
//         avatarUrl: currentUser.user_metadata.avatar_url,
//         accessToken: currentUser.user_metadata.accessToken,
//       };
//     }

//     return <Comp {...props} userInfo={userInfo} />;
//   };
// };
// export default withAuthorized;
