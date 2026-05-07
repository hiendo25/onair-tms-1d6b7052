import type { ReactNode } from "react";
import { Box } from "@mui/material";

interface ClassRoomMiniBoxProps {
  children: ReactNode;
}

const ClassRoomMiniBox = ({ children }: ClassRoomMiniBoxProps) => {
  return (
    <Box
      display="flex"
      alignItems="center"
      justifyContent="center"
      height={40}
      width={40}
      border="0.765px solid #DCE3E8"
      borderRadius="8px"
    >
      {children}
    </Box>
  );
};

export default ClassRoomMiniBox;
