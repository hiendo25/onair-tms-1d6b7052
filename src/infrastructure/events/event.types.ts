export type EventMap = {
  "notification.realtime.received": {
    id: string;
    title: string;
    body: string;
    type: string;
    url?: string;
    thumbnailUrl?: string | null;
    createdAt: string;
  };

  "notification.read": {
    notificationId: string;
  };

  "classroom.created": {
    organizationId: string;
    classRoomId: string;
    classRoomTitle: string;
    classRoomSlug: string;
    classRoomType: string;
    thumbnailUrl: string;
    startAt: string;
    platform: string;
    createdBy: string;
    receiverStudentIds: string[];
    receiverTeacherIds: string[];
  };
};
