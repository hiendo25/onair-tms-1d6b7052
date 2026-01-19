export type CreateClassRoomCertificateTemplatePayload = {
  class_room_id: string;
  certificate_template_id: string;
};

export type UpdateClassRoomCertificateTemplatePayload = {
  id: string;
  certificate_template_id: string;
};

export type DeleteClassRoomCertificateTemplatePayload = {
  class_room_id: string;
};
