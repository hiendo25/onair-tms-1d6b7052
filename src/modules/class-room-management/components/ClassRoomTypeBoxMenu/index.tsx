"use client";
import { ChevronRightDoubleIcon } from "@/shared/assets/icons";
import { Button, Typography } from "@mui/material";
import { ClassRoomPlatformType } from "@/constants/class-room.constant";
import { useState } from "react";
import { cn } from "@/utils";
import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { ClassRoomType } from "@/model/class-room.model";
import BoxItem from "./BoxItem";
import Image from "next/image";
import { PATHS } from "@/constants/path.constant";

interface ClassRoomTypeBoxMenuProps {
  items?: { path: string; title: string }[];
}
const ClassRoomTypeBoxMenu: React.FC<ClassRoomTypeBoxMenuProps> = ({ items }) => {
  const router = useRouter();
  const [isLoading, startTransition] = useTransition();
  const [platform, setPlatform] = useState<ClassRoomPlatformType>("offline");
  const [roomType, setRoomType] = useState<ClassRoomType>();

  const handleSelectManageType = (platform?: ClassRoomPlatformType) => () => {
    if (platform) setPlatform(platform);
  };

  const handleClickOk = () => {
    startTransition(() => {
      if (!roomType) return;
      router.push(`${PATHS.CLASSROOMS.CREATE_CLASSROOM}?platform=${platform}&roomtype=${roomType}`);
    });
  };

  return (
    <div className="bg-white rounded-2xl p-8 max-w-[1040px] mx-auto">
      <Typography className="font-semibold text-center text-2xl">Chọn loại lớp học</Typography>
      <div className="h-8"></div>
      <div className="grid grid-cols-3 gap-6 bg-gray-100 px-5 py-3 rounded-lg">
        <BoxMenuClassItem
          title="Lớp học trực tuyến (Live)"
          description="Buổi học diễn ra qua nền tảng trực tuyến. Người tham gia có thể học ở bất kỳ đâu chỉ với kết nối Internet."
          isActive={platform === "live"}
          onClick={handleSelectManageType("live")}
        />
        <BoxMenuClassItem
          title="Lớp học E-learning (Online)"
          description="Khóa học học qua video và tài liệu số. Học viên có thể học bất cứ lúc nào, theo tiến độ riêng của mình."
          isActive={platform === "online"}
          onClick={handleSelectManageType("online")}
        />
        <BoxMenuClassItem
          title="Lớp học trực tiếp (Offline)"
          description="Buổi học tổ chức tại địa điểm thực tế. Học viên tham gia gặp gỡ, trao đổi và trải nghiệm trực tiếp cùng
            giảng viên."
          isActive={platform === "offline"}
          onClick={handleSelectManageType("offline")}
        />
      </div>
      <div className="h-6"></div>
      <div className="class-room-type-selector grid grid-cols-2 gap-4">
        <BoxItem
          thumbnail={
            <Image src="/assets/icons/calendar-1.svg" alt="icon calendar" width={56} height={56} className="mb-3" />
          }
          title="Lớp đơn"
          description="Diễn ra trong một buổi duy nhất với thời gian cố định."
          isActive={roomType === "single"}
          onClick={() => setRoomType("single")}
        />
        <BoxItem
          thumbnail={
            <Image src="/assets/icons/calendar-2.svg" alt="icon calendar" width={56} height={56} className="mb-3" />
          }
          title="Lớp chuỗi"
          description="Gồm nhiều lớp học diễn ra vào các khung giờ khác nhau."
          isActive={roomType === "multiple"}
          onClick={() => setRoomType("multiple")}
        />
      </div>
      <div className="h-6"></div>
      <div className="py-2 text-center">
        <Button
          onClick={handleClickOk}
          disabled={isLoading || !roomType}
          loading={isLoading}
          endIcon={<ChevronRightDoubleIcon />}
          size="large"
        >
          Bắt đầu ngay
        </Button>
      </div>
    </div>
  );
};
export default ClassRoomTypeBoxMenu;

interface BoxMenuClassItemProps {
  className?: string;
  isActive?: boolean;
  onClick?: () => void;
  title?: string;
  description?: React.ReactNode;
}
const BoxMenuClassItem: React.FC<BoxMenuClassItemProps> = ({ isActive, title, onClick, description }) => {
  return (
    <div
      onClick={onClick}
      className={cn("px-4 py-3 rounded-xl cursor-pointer", {
        "bg-white shadow-[0px_0px_6px_-8px_rgb(0,0,0,0.3),0px_0px_16px_-12px_rgb(0,0,0,0.4)]": isActive,
      })}
    >
      <Typography variant="h5" className="mb-3 text-base">
        {title}
      </Typography>
      {typeof description === "string" ? (
        <Typography className="text-xs text-gray-600">{description}</Typography>
      ) : (
        <div className="description">{description}</div>
      )}
    </div>
  );
};
