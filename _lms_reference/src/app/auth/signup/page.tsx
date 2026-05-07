"use server";

import type { Metadata, ResolvingMetadata } from "next";

import SignUp from "@/modules/auth/container/SignUp";
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
    title: "Đăng ký tài khoản doanh nghiệp | ONAIR",
    openGraph: {
      images: [...previousImages],
    },
  };
}

const SignUpPage = async () => {
  return (
    <PageAuthContainer>
      <SignUp className="max-w-[450px] mx-auto w-full" />
    </PageAuthContainer>
  );
};
export default SignUpPage;
