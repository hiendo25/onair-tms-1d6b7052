import { eventBus } from "@/infrastructure/events";
import { ClassRoomNotificationService } from "../service/classroom-notification.service";

eventBus.on("classroom.created", async (payload) => {
  try {
    const service = new ClassRoomNotificationService(payload.organizationId);

    const basePayload = {
      classRoomId: payload.classRoomId,
      classRoomSlug: payload.classRoomSlug,
      classRoomTitle: payload.classRoomTitle,
      createdBy: payload.createdBy,
      platform: payload.platform,
      classRoomType: payload.classRoomType,
      startAt: payload.startAt,
      thumbnailUrl: payload.thumbnailUrl,
    };

    await Promise.allSettled([
      service.createStudentsNotification({
        ...basePayload,
        receiverEmployeeIds: payload.receiverStudentIds,
      }),
      service.createTeacherNotification({
        ...basePayload,
        receiverEmployeeIds: payload.receiverTeacherIds,
      }),
    ]);
  } catch (error) {
    console.error("[classroom.created] notification failed", error);
  }
});
