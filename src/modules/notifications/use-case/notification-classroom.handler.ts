import dayjs from "dayjs";

import { ClassRoomPlatformType, getClassRoomPlatformName } from "@/constants/class-room.constant";
import { PATHS } from "@/constants/path.constant";
import { ClassRoomType } from "@/model/class-room.model";
import { CreateNotificationPayload } from "@/repository/notifications/type";
import { client } from "@/services/api";
import { NotificationBaseService } from "../service/base-notification.service";

class NotificationClassRoomService extends NotificationBaseService {
  private organizationId: string;

  constructor(organizationId: string) {
    super();
    this.organizationId = organizationId;
  }

  async createTeacherNotification(params: {
    classRoomId: string;
    classRoomTitle: string;
    classRoomSlug: string;
    receiverEmployeeIds: string[];
    createdBy: string;
    classRoomType: ClassRoomType;
    platform: ClassRoomPlatformType;
    startAt?: string;
    thumbnailUrl?: string;
  }) {
    const {
      classRoomId,
      classRoomTitle,
      receiverEmployeeIds,
      createdBy,
      classRoomType,
      platform,
      startAt,
      classRoomSlug,
      thumbnailUrl,
    } = params;
    const title = `Bạn vừa được phân công giảng dạy <strong>lớp học ${getClassRoomPlatformName(platform)}</string>.`;
    const detailUrl = PATHS.CLASSROOMS.DETAIL_CLASSROOM(classRoomSlug);

    const body = startAt
      ? `Lớp học "${classRoomTitle}" sẽ diễn ra vào ${dayjs(startAt).format("HH:mm, DD/MM/YYYY")}.`
      : `Lớp học "${classRoomTitle}".`;

    const bulkCreatePayload = receiverEmployeeIds.map<CreateNotificationPayload>((employeeId) => ({
      title,
      body,
      type: "class_room",
      url: detailUrl,
      employee_id: employeeId,
      is_read: false,
      organization_id: this.organizationId,
      thumbnail_url: thumbnailUrl ?? null,
      data: {
        classRoomId,
        createdBy,
        classRoomType,
        classRoomSlug,
        classRoomTitle,
        platform,
      },
    }));

    this.bulkCreate(bulkCreatePayload);
  }

  async createStudentsNotification(params: {
    classRoomId: string;
    classRoomTitle: string;
    classRoomSlug: string;
    receiverEmployeeIds: string[];
    createdBy: string;
    classRoomType: ClassRoomType;
    platform: ClassRoomPlatformType;
    startAt?: string;
    thumbnailUrl?: string;
  }) {
    const {
      classRoomId,
      classRoomTitle,
      receiverEmployeeIds,
      classRoomType,
      platform,
      startAt,
      createdBy,
      classRoomSlug,
      thumbnailUrl,
    } = params;

    const title = `Bạn vừa được gán vào <strong>lớp học ${getClassRoomPlatformName(platform)}</string>.`;
    const detailUrl = PATHS.CLASSROOMS.DETAIL_CLASSROOM(classRoomSlug);

    const body = startAt
      ? `Lớp học "${classRoomTitle}" sẽ diễn ra vào ${dayjs(startAt).format("HH:mm, DD/MM/YYYY")}.`
      : `Lớp học "${classRoomTitle}".`;

    const bulkCreatePayload = receiverEmployeeIds.map<CreateNotificationPayload>((employeeId) => ({
      title,
      body,
      type: "class_room",
      url: detailUrl,
      thumbnail_url: thumbnailUrl ?? null,
      employee_id: employeeId,
      is_read: false,
      organization_id: this.organizationId,
      data: {
        classRoomId,
        createdBy,
        classRoomType,
        classRoomSlug,
        classRoomTitle,
        platform,
      },
    }));
    this.bulkCreate(bulkCreatePayload);
  }
}
export { NotificationClassRoomService };
