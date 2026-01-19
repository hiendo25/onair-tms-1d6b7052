import { GetClassRoomBySlugResponse } from "@/repository/class-room";
import { ClassRoomPriorityDto } from "@/types/dto/classRooms/classRoom.dto";
import { CLASS_SESSION_TYPE } from "../_constants";

export const mapClassRoomToQrView = (
  classRoom: GetClassRoomBySlugResponse["data"],
): ClassRoomPriorityDto | null => {
  if (!classRoom) {
    return null;
  }

  return {
    id: classRoom.id,
    title: classRoom.title,
    class_sessions: (classRoom.sessions ?? []).map((session) => ({
      id: session.id,
      title: session.title,
      start_at: session.start_at,
      end_at: session.end_at,
      is_online: session.session_type !== CLASS_SESSION_TYPE.OFFLINE,
    })),
  } as unknown as ClassRoomPriorityDto;
};
