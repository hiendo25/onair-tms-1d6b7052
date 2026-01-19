import { ClassRoomType } from "@/model/class-room.model";

export const CLASS_ROOM_PLATFORM = {
  ONLINE: "online",
  OFFLINE: "offline",
  LIVE: "live",
  HYBRID: "hybrid",
} as const;

export type ClassRoomPlatformType = (typeof CLASS_ROOM_PLATFORM)[keyof typeof CLASS_ROOM_PLATFORM];

export const getClassRoomPlatformName = (platform: ClassRoomPlatformType) => {
  const platformTypeName: Record<ClassRoomPlatformType, string> = {
    offline: "trực tiếp (Offline)",
    live: "trực tuyến (Live)",
    online: "E-learning",
    hybrid: "Hybrid",
  };
  return platformTypeName[platform];
};

export const getClassRoomType = (type: ClassRoomType) => {
  const classRoomType: Record<ClassRoomType, string> = {
    multiple: "Lớp học chuỗi",
    single: "Lớp học đơn",
  };
  return classRoomType[type];
};
