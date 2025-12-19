"use server";
import React from "react";
import { redirect } from "next/navigation";

import { CLASS_ROOM_PLATFORM, ClassRoomPlatformType } from "@/constants/class-room.constant";
import { PATHS } from "@/constants/path.constant";
import { ClassRoomType } from "@/model/class-room.model";
import PageContainer from "@/shared/ui/PageContainer";

import CreateClassRoomForm from "./_components/CreateClassRoomForm";
interface CreateClassRoomPageProps {
  searchParams: Promise<
    {
      platform: ClassRoomPlatformType;
      roomtype: ClassRoomType;
    } & Record<string, any>
  >;
}
const CreateClassRoomPage: React.FC<CreateClassRoomPageProps> = async ({ searchParams }) => {
  const { platform, roomtype } = await searchParams;

  const PLATFORMS: ClassRoomPlatformType[] = [
    CLASS_ROOM_PLATFORM.HYBRID,
    CLASS_ROOM_PLATFORM.LIVE,
    CLASS_ROOM_PLATFORM.OFFLINE,
    CLASS_ROOM_PLATFORM.ONLINE,
  ];
  const ROOMS: ClassRoomType[] = ["multiple", "single"];

  if (!ROOMS.includes(roomtype) || !PLATFORMS.includes(platform)) {
    redirect(PATHS.CLASSROOMS.ROOT);
  }

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
      <div className="max-w-[1200px]">
        <CreateClassRoomForm platform={platform} roomType={roomtype} />
      </div>
    </PageContainer>
  );
};
export default CreateClassRoomPage;
