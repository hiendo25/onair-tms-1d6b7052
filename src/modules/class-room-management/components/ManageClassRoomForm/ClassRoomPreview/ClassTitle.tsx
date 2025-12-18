import { alpha,Box, Typography } from "@mui/material";
import Image from "next/image";
import { Control, useController } from "react-hook-form";

import { ClassRoom } from "../classroom-form.schema";

export interface ClassTitleProps {
  control: Control<ClassRoom>;
}
const ClassTitle: React.FC<ClassTitleProps> = ({ control }) => {
  const {
    field: { value: title },
  } = useController({ control, name: "title" });
  return (
    <div className="pewview-ui__title">
      {title ? (
        <Typography sx={{ fontWeight: "bold" }}>{title}</Typography>
      ) : (
        <Box
          sx={(theme) => ({
            width: "100%",
            height: "32px",
            borderRadius: "8px",
            border: "2px solid",
            borderColor: alpha(theme.palette.primary["main"], 0.1),
            backgroundColor: alpha(theme.palette.primary["main"], 0.08),
          })}
        ></Box>
      )}
    </div>
  );
};
export default ClassTitle;
