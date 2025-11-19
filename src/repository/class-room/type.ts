import { ClassRoom } from "@/model/class-room.model";

export type CreateClassRoomPayload = Pick<
  ClassRoom,
  | "description"
  // | "comunity_info"
  | "room_type"
  | "slug"
  | "start_at"
  | "end_at"
  | "status"
  | "thumbnail_url"
  | "title"
  | "organization_id"
  | "resource_id"
  | "employee_id"
  | "documents"
>;
export type UpdateClassRoomPayload = Pick<
  ClassRoom,
  | "description"
  // | "comunity_info"
  | "room_type"
  | "slug"
  | "start_at"
  | "end_at"
  | "status"
  | "thumbnail_url"
  | "title"
  | "organization_id"
  | "resource_id"
  | "employee_id"
  | "id"
  | "documents"
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
