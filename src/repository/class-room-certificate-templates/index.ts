import { createClient } from "@/services/supabase/client";

import {
  CreateClassRoomCertificateTemplatePayload,
  UpdateClassRoomCertificateTemplatePayload,
  DeleteClassRoomCertificateTemplatePayload,
} from "./type";

export const createClassRoomCertificateTemplate = async (
  payload: CreateClassRoomCertificateTemplatePayload
) => {
  const supabase = createClient();
  try {
    const { data, error } = await supabase
      .from("class_room_certificate_templates")
      .insert(payload)
      .select("*")
      .single();

    if (!data || error) {
      throw new Error(error.message);
    }
    return data;
  } catch (err: any) {
    throw new Error(`Failed to create class room certificate template: ${err?.message}`);
  }
};
export type CreateClassRoomCertificateTemplateResponse = Awaited<
  ReturnType<typeof createClassRoomCertificateTemplate>
>;

export const updateClassRoomCertificateTemplate = async (
  payload: UpdateClassRoomCertificateTemplatePayload
) => {
  const supabase = createClient();
  try {
    const { id: recordId, ...restPayload } = payload;
    const { data, error } = await supabase
      .from("class_room_certificate_templates")
      .update(restPayload)
      .eq("id", recordId)
      .select("*")
      .single();

    if (!data || error) {
      throw new Error(error.message);
    }
    return data;
  } catch (err: any) {
    throw new Error(`Failed to update class room certificate template: ${err?.message}`);
  }
};
export type UpdateClassRoomCertificateTemplateResponse = Awaited<
  ReturnType<typeof updateClassRoomCertificateTemplate>
>;

export const getClassRoomCertificateTemplateByClassRoomId = async (classRoomId: string) => {
  const supabase = createClient();
  try {
    const { data, error } = await supabase
      .from("class_room_certificate_templates")
      .select(
        `
          id,
          class_room_id,
          certificate_template_id,
          created_at,
          certificate_template:certificate_templates!class_room_certificate_templates_certificate_template_id_fkey(
            id,
            name,
            layout_config,
            frame_id,
            frame:certificate_frames!certificate_templates_frame_id_fkey(
              id,
              image_url
            )
          )
        `
      )
      .eq("class_room_id", classRoomId)
      .single();

    if (error && error.code !== "PGRST116") {
      // PGRST116 is "not found" error
      throw new Error(error.message);
    }
    return data;
  } catch (err: any) {
    throw new Error(`Failed to fetch class room certificate template: ${err?.message}`);
  }
};
export type GetClassRoomCertificateTemplateByClassRoomIdResponse = Awaited<
  ReturnType<typeof getClassRoomCertificateTemplateByClassRoomId>
>;

export const deleteClassRoomCertificateTemplate = async (
  payload: DeleteClassRoomCertificateTemplatePayload
) => {
  const supabase = createClient();
  try {
    const { error } = await supabase
      .from("class_room_certificate_templates")
      .delete()
      .eq("class_room_id", payload.class_room_id);

    if (error) {
      throw new Error(error.message);
    }
    return { success: true };
  } catch (err: any) {
    throw new Error(`Failed to delete class room certificate template: ${err?.message}`);
  }
};
