import { ClassRoom } from "@/model/class-room.model";

export type CreateClassRoomPayload = Pick<
  ClassRoom,
  | "description"
  | "room_type"
  | "slug"
  | "start_at"
  | "end_at"
  | "status"
  | "thumbnail_url"
  | "title"
  | "organization_id"
  | "employee_id"
>;
export type UpdateClassRoomPayload = Pick<
  ClassRoom,
  | "id"
  | "title"
  | "slug"
  | "description"
  | "room_type"
  | "start_at"
  | "end_at"
  | "status"
  | "thumbnail_url"
  | "organization_id"
  | "employee_id"
>;
export type UpSertClassRoomPayload =
  | {
      action: "create";
      payload: CreateClassRoomPayload;
    }
  | {
      action: "update";
      payload: UpdateClassRoomPayload;
    };

export type CreatePivotClassRoomAndHashTagPayload = {
  class_room_id: string;
  hash_tag_id: string;
};
export type CreatePivotClassRoomAndFieldPayload = {
  class_room_id: string;
  class_field_id: string;
};

export type CreatePivotClassRoomAndEmployeePayload = {
  class_room_id: string;
  employee_id: string;
};
export type DeletePivotClassRoomAndEmployeePayload = {
  class_room_id: string;
  employeeIds: string[];
};

export type CreatePivotClassRoomWithResourcePayload = {
  class_room_id: string;
  resource_id: string;
};
