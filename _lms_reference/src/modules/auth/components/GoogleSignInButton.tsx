"use client";
import Button, { ButtonProps } from "@mui/material/Button";

import { GoogleIcon } from "@/shared/assets/icons";
import { useAuthSignInWithGoogle } from "../hooks/useAuthSignIn";
interface GoogleSignInButtonProps extends ButtonProps {
  buttonText?: string;
}
const GoogleSignInButton: React.FC<GoogleSignInButtonProps> = ({
  buttonText = "Đăng ký với Google",
  ...restProps
}) => {
  const { signInWithGoogle, isPending } = useAuthSignInWithGoogle();
  return (
    <Button
      variant="outlined"
      startIcon={<GoogleIcon />}
      fullWidth
      loading={isPending}
      onClick={signInWithGoogle}
      {...restProps}
    >
      {buttonText}
    </Button>
  );
};
export default GoogleSignInButton;
