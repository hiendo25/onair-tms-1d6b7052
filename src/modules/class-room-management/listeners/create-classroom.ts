import { ClassRoomPlatformType } from "@/constants/class-room.constant";
import { eventBus } from "@/infrastructure/events";
import { ClassRoomNotificationService } from "../service/classroom-notification.service";

eventBus.on("classroom.created", async (payload) => {
  const classRoomService = new ClassRoomNotificationService(payload.organizationId);

  const data = await classRoomService.createStudentsNotification({
    classRoomId: payload.classRoomId,
    classRoomSlug: payload.classRoomSlug,
    classRoomTitle: payload.classRoomTitle,
    receiverEmployeeIds: payload.receiverStudentIds,
    createdBy: payload.createdBy,
    platform: payload.platform as ClassRoomPlatformType,
    classRoomType: payload.classRoomType as "single" | "multiple",
    startAt: payload.startAt,
    thumbnailUrl: payload.thumbnailUrl,
  });
  console.log("listen event then do classroom.created", payload);
});
