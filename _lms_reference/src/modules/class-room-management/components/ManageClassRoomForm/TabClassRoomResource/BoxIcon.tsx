import { alpha, styled } from "@mui/material";
import { Box } from "@mui/material";
const BoxIcon = styled(Box)(({ theme }) => ({
  width: "2.5rem",
  height: "2.5rem",
  backgroundColor: alpha(theme.palette.primary["light"], 0.2),
  color: theme.palette.primary["main"],
  borderRadius: "0.5rem",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
}));
export default BoxIcon;
