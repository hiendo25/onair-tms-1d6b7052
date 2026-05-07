export type CreateClassRoomCertificateTemplatePayload = {
  class_room_id: string;
  certificate_template_id: string;
  days_to_expire?: number | null;
};

export type UpdateClassRoomCertificateTemplatePayload = {
  id: string;
  certificate_template_id: string;
  days_to_expire?: number | null;
};

export type DeleteClassRoomCertificateTemplatePayload = {
  class_room_id: string;
};
