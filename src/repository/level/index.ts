import { supabase } from "@/services";

import { CreateLevelPayload, UpdateLevelPayload, UpdateStatusLevelPayload } from "./type";
const createLevel = async (payload: CreateLevelPayload) => {
  try {
    const { data, error } = await supabase.from("levels").insert(payload).select("*").single();
    if (!data || error) {
      throw new Error(error.message);
    }
    return data;
  } catch (err: any) {
    throw new Error(`Failed to create: ${err?.message}`);
  }
};
export type CreateLevelResponse = Awaited<ReturnType<typeof createLevel>>;

const updateLevel = async (payload: UpdateLevelPayload) => {
  try {
    const { id: recordId, ...restPayload } = payload;
    const { data, error } = await supabase.from("levels").update(restPayload).eq("id", recordId).select("*").single();

    if (!data || error) {
      throw new Error(error.message);
    }
    return data;
  } catch (err: any) {
    throw new Error(`Failed to create: ${err?.message}`);
  }
};
export type UpdateLevelResponse = Awaited<ReturnType<typeof updateLevel>>;

const updateStatusLevel = async (payload: UpdateStatusLevelPayload) => {
  try {
    const { id: recordId, status } = payload;
    const { data, error } = await supabase.from("levels").update({ status }).eq("id", recordId).select("*").single();

    if (!data || error) {
      throw new Error(error.message);
    }
    return data;
  } catch (err: any) {
    throw new Error(`Failed to create: ${err?.message}`);
  }
};
export type UpdateStatusLevelResponse = Awaited<ReturnType<typeof updateStatusLevel>>;

export type GetLevelQueryParams = {
  page?: number;
  pageSize?: number;
  organizationId?: string;
};
const getLevels = async (params?: GetLevelQueryParams) => {
  const { page = 1, pageSize = 10, organizationId } = params || {};
  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;
  try {
    let query = supabase.from("levels").select(
      `
				id,
				title,
				description,
				score_required,
				created_by,
				created_at,
				icon,
				status,
				createdBy:employees!levels_created_by_fkey(
					id,
					employee_code,
					profiles(
					id,
					full_name,
					email
				)
				)
			`,
    );

    query = query.filter("status", "not.eq", "deleted");
    if (organizationId) {
      query = query.eq("organization_id", organizationId);
    }

    return query
      .order("score_required", { ascending: false })
      .range(from, to)
      .overrideTypes<Array<{ status: "active" | "inactive" }>>();
  } catch (err) {
    throw new Error("Failed to create Level");
  }
};
export type GetLevelsResponse = Awaited<ReturnType<typeof getLevels>>;

export { createLevel, updateLevel, updateStatusLevel, getLevels };
