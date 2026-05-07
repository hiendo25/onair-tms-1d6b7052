import { createClient } from "@/services/supabase/client";

export type GetCertificateFramesParams = {
  organizationId: string;
  page?: number;
  pageSize?: number;
};

/**
 * Get certificate frames for an organization
 * Includes count of linked templates for delete protection
 */
export const getCertificateFrames = async (params: GetCertificateFramesParams) => {
  const supabase = createClient();
  const { organizationId, page = 1, pageSize = 20 } = params;
  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;

  try {
    let query = supabase
      .from("certificate_frames")
      .select(
        `
        id,
        image_url,
        created_at,
        certificate_templates(count)
      `,
        { count: "exact" }
      )
      .eq("organization_id", organizationId);

    return query.order("created_at", { ascending: false }).range(from, to);
  } catch (err) {
    throw new Error("Failed to fetch certificate frames");
  }
};
export type GetCertificateFramesResponse = Awaited<ReturnType<typeof getCertificateFrames>>;

/**
 * Create a certificate frame
 */
export const createCertificateFrame = async (payload: {
  organization_id: string;
  created_by: string;
  image_url: string;
}) => {
  const supabase = createClient();
  try {
    const { data, error } = await supabase
      .from("certificate_frames")
      .insert(payload)
      .select("*")
      .single();

    if (!data || error) {
      throw new Error(error.message);
    }
    return data;
  } catch (err: any) {
    throw new Error(`Failed to create certificate frame: ${err?.message}`);
  }
};
export type CreateCertificateFrameResponse = Awaited<ReturnType<typeof createCertificateFrame>>;

/**
 * Delete a certificate frame
 * Note: Only delete frames that are not linked to any templates (checked in UI)
 */
export const deleteCertificateFrame = async (id: string) => {
  const supabase = createClient();
  try {
    const { error } = await supabase
      .from("certificate_frames")
      .delete()
      .eq("id", id);

    if (error) {
      throw new Error(error.message);
    }
    return { success: true };
  } catch (err: any) {
    throw new Error(`Failed to delete certificate frame: ${err?.message}`);
  }
};
export type DeleteCertificateFrameResponse = Awaited<ReturnType<typeof deleteCertificateFrame>>;
