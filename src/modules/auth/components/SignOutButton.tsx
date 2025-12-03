import IconButton from "@mui/material/IconButton";
import LogoutRoundedIcon from "@mui/icons-material/LogoutRounded";
import useAuthSignOut from "../hooks/useAuthSignOut";
import { Button, Typography } from "@mui/material";
import { cn } from "@/utils";

interface SignOutButtonProps {
  type?: "icon";
  btnText?: string;
  className?: string;
}
const SignOutButton: React.FC<SignOutButtonProps> = ({ type, btnText = "Đăng xuất", className }) => {
  const { signOut, isPending } = useAuthSignOut();

  if (type === "icon") {
    return (
      <IconButton size="small" onClick={signOut} loading={isPending} className={cn("rounded-lg", className)}>
        <LogoutRoundedIcon fontSize="small" />
      </IconButton>
    );
  }
  return (
    <Button
      onClick={signOut}
      loading={isPending}
      variant="fill"
      color="inherit"
      startIcon={<LogoutRoundedIcon fontSize="small" />}
      className={cn("h-10 justify-self-start", className)}
    >
      {btnText}
    </Button>
  );
};
export default SignOutButton;
