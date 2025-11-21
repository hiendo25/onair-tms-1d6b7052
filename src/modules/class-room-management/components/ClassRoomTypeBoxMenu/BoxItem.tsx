"use client";
import { Dispatch, memo, SetStateAction } from "react";
import { cn } from "@/utils";
import { Box, FormControlLabel, Radio, Typography } from "@mui/material";
import { ClassRoomType } from "@/model/class-room.model";
export interface RoomTypeItemsProps {
  className?: string;
  value: NonNullable<ClassRoomType> | undefined;
  setRoomType: Dispatch<SetStateAction<NonNullable<ClassRoomType> | undefined>>;
}

interface BoxItemProps {
  isActive?: boolean;
  title?: string;
  description?: string;
  thumbnail: React.ReactNode;
  onClick?: () => void;
}
const BoxItem: React.FC<BoxItemProps> = memo(({ isActive, title, description, onClick, thumbnail }) => {
  return (
    <Box
      className={cn("bg-white rounded-xl p-4 border relative", {
        "border-gray-200": !isActive,
        "border-blue-700!": isActive,
        "cursor-pointer": onClick,
      })}
      onClick={onClick}
    >
      <div className="select-item__thumbnail">{thumbnail}</div>
      <div className="select-item-content">
        {title ? (
          <Typography component="h4" className="font-bold mb-2 text-base">
            {title}
          </Typography>
        ) : null}
        {description ? (
          <Typography variant="body2" className="text-gray-600">
            {description}
          </Typography>
        ) : null}
      </div>
      <FormControlLabel label="" control={<Radio />} checked={isActive} className="absolute top-2 right-2 mr-0" />
    </Box>
  );
});
export default BoxItem;
