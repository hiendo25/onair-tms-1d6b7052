"use server";
import React from "react";
import { redirect } from "next/navigation";

import { CLASS_ROOM_PLATFORM, ClassRoomPlatformType } from "@/constants/class-room.constant";
import { PATHS } from "@/constants/path.constant";
import { ClassRoomType } from "@/model/class-room.model";
import ClassRoomTypeBoxMenu from "@/modules/class-room-management/components/ClassRoomTypeBoxMenu";
import PageContainer from "@/shared/ui/PageContainer";

import CreateClassRoomForm from "./_components/CreateClassRoomForm";
interface CreateClassRoomPageProps {
  searchParams: Promise<
    {
      platform: ClassRoomPlatformType;
      roomType: ClassRoomType;
      classType: "default" | "learning_path";
    } & Record<string, any>
  >;
}
const CreateClassRoomPage: React.FC<CreateClassRoomPageProps> = async ({ searchParams }) => {
  const { platform, roomType, classType } = await searchParams;

  const PLATFORMS = new Map<ClassRoomPlatformType, ClassRoomPlatformType>([
    [CLASS_ROOM_PLATFORM.HYBRID, CLASS_ROOM_PLATFORM.HYBRID],
    [CLASS_ROOM_PLATFORM.LIVE, CLASS_ROOM_PLATFORM.LIVE],
    [CLASS_ROOM_PLATFORM.OFFLINE, CLASS_ROOM_PLATFORM.OFFLINE],
    [CLASS_ROOM_PLATFORM.ONLINE, CLASS_ROOM_PLATFORM.ONLINE],
  ]);
  const ROOMS = new Map<ClassRoomType, ClassRoomType>([
    ["multiple", "multiple"],
    ["single", "single"],
  ]);

  const platformTypeName: Record<ClassRoomPlatformType, string> = {
    offline: "trực tiếp (Offline)",
    live: "trực tuyến (Live)",
    online: "E-learning",
    hybrid: "Hybrid",
  };
  const pageTitle = `Tạo lớp học ${platformTypeName[platform] ?? ""}`;

  return (
    <PageContainer
      title={pageTitle}
      contained
      breadcrumbs={[
        {
          title: "Quản lý lớp học",
          path: PATHS.CLASSROOMS.ROOT,
        },
        {
          title: pageTitle,
        },
      ]}
    >
      {!platform || !roomType || !PLATFORMS.has(platform) || !ROOMS.has(roomType) ? (
        <ClassRoomTypeBoxMenu />
      ) : (
        <CreateClassRoomForm platform={platform} roomType={roomType} isLearningPath={classType === "learning_path"} />
      )}
    </PageContainer>
  );
};
export default CreateClassRoomPage;
