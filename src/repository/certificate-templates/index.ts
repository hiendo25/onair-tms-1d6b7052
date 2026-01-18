import { createClient } from "@/services/supabase/client";

import {
  CreateCertificateTemplatePayload,
  UpdateCertificateTemplatePayload,
  GetCertificateTemplatesQueryParams,
} from "./type";

const createCertificateTemplate = async (payload: CreateCertificateTemplatePayload) => {
  const supabase = createClient();
  try {
    const { data, error } = await supabase
      .from("certificate_templates")
      .insert(payload)
      .select("*")
      .single();

    if (!data || error) {
      throw new Error(error.message);
    }
    return data;
  } catch (err: any) {
    throw new Error(`Failed to create certificate template: ${err?.message}`);
  }
};
export type CreateCertificateTemplateResponse = Awaited<ReturnType<typeof createCertificateTemplate>>;

const updateCertificateTemplate = async (payload: UpdateCertificateTemplatePayload) => {
  const supabase = createClient();
  try {
    const { id: recordId, ...restPayload } = payload;
    const { data, error } = await supabase
      .from("certificate_templates")
      .update(restPayload)
      .eq("id", recordId)
      .select("*")
      .single();

    if (!data || error) {
      throw new Error(error.message);
    }
    return data;
  } catch (err: any) {
    throw new Error(`Failed to update certificate template: ${err?.message}`);
  }
};
export type UpdateCertificateTemplateResponse = Awaited<ReturnType<typeof updateCertificateTemplate>>;

const getCertificateTemplates = async (params?: GetCertificateTemplatesQueryParams) => {
  const supabase = createClient();
  const { page = 1, pageSize = 20, organizationId, search } = params || {};
  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;

  try {
    let query = supabase.from("certificate_templates").select(
      `
        id,
        name,
        description,
        frame_id,
        created_at,
        created_by,
        frame:certificate_frames!certificate_templates_frame_id_fkey(
          id,
          image_url
        ),
        createdBy:employees!certificate_templates_created_by_fkey(
          id,
          employee_code,
          profiles(
            id,
            full_name,
            email
          )
        )
      `,
      { count: "exact" }
    );

    if (organizationId) {
      query = query.eq("organization_id", organizationId);
    }

    if (search) {
      query = query.or(`name.ilike.%${search}%`);
    }

    return query.order("created_at", { ascending: false }).range(from, to);
  } catch (err) {
    throw new Error("Failed to fetch certificate templates");
  }
};
export type GetCertificateTemplatesResponse = Awaited<ReturnType<typeof getCertificateTemplates>>;

const getCertificateTemplateById = async (id: string) => {
  const supabase = createClient();
  try {
    const { data, error } = await supabase
      .from("certificate_templates")
      .select(
        `
          id,
          name,
          description,
          frame_id,
          created_at,
          created_by,
          frame:certificate_frames!certificate_templates_frame_id_fkey(
            id,
            image_url
          ),
          createdBy:employees!certificate_templates_created_by_fkey(
            id,
            employee_code,
            profiles(
              id,
              full_name,
              email
            )
          )
        `
      )
      .eq("id", id)
      .single();

    if (!data || error) {
      throw new Error(error.message);
    }
    return data;
  } catch (err: any) {
    throw new Error(`Failed to fetch certificate template: ${err?.message}`);
  }
};
export type GetCertificateTemplateByIdResponse = Awaited<ReturnType<typeof getCertificateTemplateById>>;

const deleteCertificateTemplate = async (id: string) => {
  const supabase = createClient();
  try {
    const { error } = await supabase
      .from("certificate_templates")
      .delete()
      .eq("id", id);

    if (error) {
      throw new Error(error.message);
    }
    return { success: true };
  } catch (err: any) {
    throw new Error(`Failed to delete certificate template: ${err?.message}`);
  }
};
export type DeleteCertificateTemplateResponse = Awaited<ReturnType<typeof deleteCertificateTemplate>>;

export {
  createCertificateTemplate,
  updateCertificateTemplate,
  getCertificateTemplates,
  getCertificateTemplateById,
  deleteCertificateTemplate,
};
