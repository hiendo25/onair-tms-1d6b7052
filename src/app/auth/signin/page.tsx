import React from "react";
import type { Metadata, ResolvingMetadata } from "next";

import SignIn from "@/modules/auth/components/SignIn";
import PageAuthContainer from "../_components/PageAuthContainer";

interface SignInPageProps {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export async function generateMetadata(
  { params, searchParams }: SignInPageProps,
  parent: ResolvingMetadata,
): Promise<Metadata> {
  const previousImages = (await parent).openGraph?.images || [];

  return {
    title: "Đăng nhập tài khoản | ONAIR",
    openGraph: {
      images: [...previousImages],
    },
  };
}

const SignInPage: React.FC<SignInPageProps> = () => {
  return (
    <PageAuthContainer className="h-screen">
      <SignIn className="max-w-[450px] mx-auto" />
    </PageAuthContainer>
  );
};
export default SignInPage;
