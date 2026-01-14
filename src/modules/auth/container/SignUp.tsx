"use client";
import React, { useTransition } from "react";
import { Activity } from "react";
import Box from "@mui/material/Box";
import Divider from "@mui/material/Divider";
import Typography from "@mui/material/Typography";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useSnackbar } from "notistack";

import AuthCard from "../components/AuthCard";
import GoogleSignInButton from "../components/GoogleSignInButton";
import SignUpForm, { SignUpFormProps } from "../components/SignUpForm";
import { useSignUpMutation } from "../operations/mutation";
export interface SignUpProps {
  className?: string;
}
const SignUp: React.FC<SignUpProps> = ({ className }) => {
  const [isTransition, startTransition] = useTransition();
  const { mutate: doSignUp, isPending } = useSignUpMutation();
  const { enqueueSnackbar } = useSnackbar();
  const router = useRouter();
  const handleSubmitForm: SignUpFormProps["onSubmit"] = (formData) => {
    doSignUp(
      {
        email: formData.email,
        fullName: formData.fullName,
        password: formData.password,
        employeeType: formData.userType,
      },
      {
        onSuccess(data, variables, onMutateResult, context) {
          enqueueSnackbar("Tạo tài khoản thành công.", { variant: "success" });
          console.log(data);
          startTransition(() => {
            router.push("/auth/signin");
          });
        },
        onError(error, variables, onMutateResult, context) {
          console.log(error);
        },
      },
    );
  };
  return (
    <AuthCard title="Đăng ký" description="Đăng ký tài khoản doanh nghiệp của bạn." className={className}>
      <SignUpForm onSubmit={handleSubmitForm} isSubmitting={isPending || isTransition} />
      <Activity mode="hidden">
        <Divider>
          <Typography sx={{ color: "text.secondary" }}>Hoặc</Typography>
        </Divider>
        <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
          <GoogleSignInButton buttonText="Đăng ký với Google" disabled={isPending} />
          <Typography sx={{ textAlign: "center" }}>
            Bạn đã có tài khoản? <Link href="/auth/signin">đăng nhập</Link>
          </Typography>
        </Box>
      </Activity>
    </AuthCard>
  );
};
export default SignUp;
