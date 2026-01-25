"use client";
import React, { useMemo, useState } from "react";
import { useTransition } from "react";
import { Button, Checkbox, FormControlLabel, Typography } from "@mui/material";
import Image from "next/image";
import { useRouter } from "next/navigation";

import { ClassRoomPlatformType } from "@/constants/class-room.constant";
import { PATHS } from "@/constants/path.constant";
import { ClassRoomType } from "@/model/class-room.model";
import { ChevronRightDoubleIcon } from "@/shared/assets/icons";
import { cn } from "@/utils";

import BoxItem from "./BoxItem";

interface ClassRoomTypeBoxMenuProps {
  items?: { path: string; title: string }[];
}
const ClassRoomTypeBoxMenu: React.FC<ClassRoomTypeBoxMenuProps> = ({ items }) => {
  const router = useRouter();
  const [isLoading, startTransition] = useTransition();
  const [classRoomType, setClassRoomType] = useState<{
    type?: ClassRoomType;
    platform?: ClassRoomPlatformType;
    classType: "default" | "learning_path";
  }>({
    type: undefined,
    platform: undefined,
    classType: "default",
  });

  const handleSelectManageType = (platform?: ClassRoomPlatformType) => () => {
    setClassRoomType((prev) => ({ ...prev, platform: platform }));
  };
  const handleSelectRoomType = (type: ClassRoomType) => () => {
    setClassRoomType((prev) => ({ ...prev, type }));
  };

  const handleChangeLearningPath = (checked: boolean) => {
    setClassRoomType((prev) => ({ ...prev, classType: checked ? "learning_path" : "default" }));
  };

  const disabledOkButton = useMemo(() => {
    return !classRoomType?.platform || !classRoomType?.type;
  }, [classRoomType]);

  const handleClickOk = () => {
    const { platform, type } = classRoomType;
    startTransition(() => {
      if (!type || !platform) return;
      router.push(
        `${PATHS.CLASSROOMS.CREATE_CLASSROOM}?platform=${platform}&roomType=${type}&classType=${classRoomType.classType}`,
      );
    });
  };

  return (
    <div
      className="bg-white rounded-2xl p-6 max-w-[1040px] mx-auto border border-gray-200"
      style={{ boxShadow: "var(--paper-shadow)" }}
    >
      <Typography className="font-semibold text-center text-2xl">Chọn loại lớp học</Typography>
      <div className="h-8"></div>
      <div className="grid grid-cols-3 gap-6 bg-gray-100 px-5 py-4 rounded-lg">
        <BoxMenuClassItem
          title="Lớp học trực tuyến (Live)"
          description="Buổi học diễn ra qua nền tảng trực tuyến. Người tham gia có thể học ở bất kỳ đâu chỉ với kết nối Internet."
          isActive={classRoomType?.platform === "live"}
          onClick={handleSelectManageType("live")}
        />
        <BoxMenuClassItem
          title="Lớp học E-learning (Online)"
          description="Khóa học học qua video và tài liệu số. Học viên có thể học bất cứ lúc nào, theo tiến độ riêng của mình."
          isActive={classRoomType?.platform === "online"}
          onClick={handleSelectManageType("online")}
        />
        <BoxMenuClassItem
          title="Lớp học trực tiếp (Offline)"
          description="Buổi học tổ chức tại địa điểm thực tế. Học viên tham gia gặp gỡ, trao đổi và trải nghiệm trực tiếp cùng
            giảng viên."
          isActive={classRoomType?.platform === "offline"}
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
          isActive={classRoomType?.type === "single"}
          onClick={handleSelectRoomType("single")}
        />
        <BoxItem
          thumbnail={
            <Image src="/assets/icons/calendar-2.svg" alt="icon calendar" width={56} height={56} className="mb-3" />
          }
          title="Lớp chuỗi"
          description="Gồm nhiều lớp học diễn ra vào các khung giờ khác nhau."
          isActive={classRoomType?.type === "multiple"}
          onClick={handleSelectRoomType("multiple")}
        />
      </div>
      <div className="h-6"></div>
      <div className="">
        <FormControlLabel
          onChange={(evt, checked) => handleChangeLearningPath(checked)}
          control={<Checkbox />}
          label="Lớp học lộ trình"
          className="text-sm w-fit"
        />
      </div>
      <div className="h-6"></div>
      <div className="py-2 text-center">
        <Button
          onClick={handleClickOk}
          disabled={isLoading || disabledOkButton}
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
