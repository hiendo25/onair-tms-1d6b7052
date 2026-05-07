import { JSXElementConstructor, ReactElement } from "react";
import { Chip, ChipPropsColorOverrides } from "@mui/material";

interface ILearningPathChip {
  icon?: ReactElement<unknown, string | JSXElementConstructor<any>>
  label: string | null,
  color?: "default" | "primary" | "secondary" | "error" | "info" | "success" | "warning"
}

const LearningPathChip = ({ icon, label, color = "default" }: ILearningPathChip) => {
  return (
    <Chip
      icon={icon}
      label={label}
      size="small"
      color={color}
      sx={{ borderRadius: "6px", color: "black" }}
    />
  );
}

export default LearningPathChip;