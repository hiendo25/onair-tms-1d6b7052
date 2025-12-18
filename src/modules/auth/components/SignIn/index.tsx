"use client";
import * as React from "react";
import { Alert } from "@mui/material";
import Typography from "@mui/material/Typography";

import { useAuthSignInWithPassword } from "../../hooks/useAuthSignIn";
import AuthCard from "../AuthCard";
import GoogleSignInButton from "../GoogleSignInButton";

import SignInFormClient, { SignInFormClientProps } from "./SignInFormClient";

interface SignInProps {
  className?: string;
}
export default function SignIn({ className }: SignInProps) {
  const { signInWithPassword, isPending, error } = useAuthSignInWithPassword();
  const handleLogin: SignInFormClientProps["onSubmit"] = async ({
    email,
    password,
  }) => {
    signInWithPassword({ email, password });
  };
  return (
    <AuthCard
      title="Đăng nhập"
      description="Truy cập vào OnAir LMS để bắt đầu hành trình học tập và phát triển của bạn"
      className={className}
    >
      {error && (
        <Alert variant="outlined" severity="error">
          {error.message}
        </Alert>
      )}
      <SignInFormClient onSubmit={handleLogin} isSubmitting={isPending} />
      <Typography
        sx={{ fontWeight: "bold", fontSize: "0.875rem", margin: "auto" }}
      >
        Hoặc
      </Typography>
      <GoogleSignInButton
        size="large"
        buttonText="Đăng nhập với Google"
        disabled={isPending}
      />
    </AuthCard>
  );
}
