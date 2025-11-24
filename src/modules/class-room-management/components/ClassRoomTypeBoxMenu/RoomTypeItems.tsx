"use client";
import { Dispatch, memo, SetStateAction } from "react";
import Image from "next/image";
import { cn } from "@/utils";
import { Box, Typography } from "@mui/material";
import { ClassRoomType } from "@/model/class-room.model";
export interface RoomTypeItemsProps {
  className?: string;
  value: NonNullable<ClassRoomType> | undefined;
  setRoomType: Dispatch<SetStateAction<NonNullable<ClassRoomType> | undefined>>;
}
const RoomTypeItems: React.FC<RoomTypeItemsProps> = ({ className, value, setRoomType }) => {
  return (
    <div className="class-room-type-selector grid grid-cols-2 gap-6">
      <BoxItem
        thumbnail={
          <Image src="/assets/icons/calendar-1.svg" alt="icon calendar" width={56} height={56} className="mb-3" />
        }
        title="Lớp đơn"
        description="Diễn ra trong một buổi duy nhất với thời gian cố định."
        isActive={value === "single"}
        onClick={() => setRoomType("single")}
      />
      <BoxItem
        thumbnail={
          <Image src="/assets/icons/calendar-2.svg" alt="icon calendar" width={56} height={56} className="mb-3" />
        }
        title="Lớp chuỗi"
        description="Gồm nhiều lớp học diễn ra vào các khung giờ khác nhau."
        isActive={value === "multiple"}
        onClick={() => setRoomType("multiple")}
      />
    </div>
  );
};
export default memo(RoomTypeItems);

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
      className={cn("bg-white rounded-xl p-4 border cursor-pointer", {
        "border-gray-200": !isActive,
        "border-blue-700!": isActive,
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
    </Box>
  );
});
