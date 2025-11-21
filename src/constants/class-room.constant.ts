export const CLASS_ROOM_PLATFORM = {
  ONLINE: "online",
  OFFLINE: "offline",
  LIVE: "live",
  HYBRID: "hybrid",
} as const;

export type ClassRoomPlatformType = (typeof CLASS_ROOM_PLATFORM)[keyof typeof CLASS_ROOM_PLATFORM];
