"use client";
import * as React from "react";
import Box from "@mui/material/Box";
import Divider from "@mui/material/Divider";
import Typography from "@mui/material/Typography";
import Link from "next/link";

import useAuthSignUp from "../../hooks/useAuthSignUp";
import AuhCard from "../AuthCard";
import GoogleSignInButton from "../GoogleSignInButton";

import SignUpFormClient, { SignUpFormClientProps } from "./SignupFormClient";
export interface SignUpProps {
  className?: string;
}
const SignUp: React.FC<SignUpProps> = ({ className }) => {
  const { signUp, isPending } = useAuthSignUp();

  const handleSubmitForm: SignUpFormClientProps["onSubmit"] = (formData) => {
    signUp({ email: formData.email, password: formData.password });
  };
  return (
    <AuhCard
      title="Đăng ký"
      description="Truy cập vào OnAir LMS để bắt đầu hành trình học tập và phát triển của bạn"
      className={className}
    >
      <SignUpFormClient onSubmit={handleSubmitForm} isSubmitting={isPending} />
      <Divider>
        <Typography sx={{ color: "text.secondary" }}>Hoặc</Typography>
      </Divider>
      <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
        <GoogleSignInButton
          buttonText="Đăng ký với Google"
          disabled={isPending}
        />
        <Typography sx={{ textAlign: "center" }}>
          Bạn đã có tài khoản? <Link href="/auth/signin">đăng nhập</Link>
        </Typography>
      </Box>
    </AuhCard>
  );
};
export default SignUp;
