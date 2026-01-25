import { mapPostgrestError } from "@/lib/errors/map-postgrest-error";
import { supabase } from "@/services";

import { LevelInsert, LevelStatusUpdate, LevelUpdate } from "./level.type";
const createLevel = async (insert: LevelInsert) => {
  const { data, error } = await supabase
    .from("levels")
    .insert(insert)
    .select(
      `	*,
				organizations(
					id, 
					name
				),
				createdBy:employees!levels_created_by_fkey(
					id,
					employee_code,
					profiles(
						id,
						full_name,
						email
					)
				)`,
    )
    .single();
  if (error) {
    throw mapPostgrestError(error);
  }
  return data;
};
export type CreateLevelRecord = Awaited<ReturnType<typeof createLevel>>;

const updateLevel = async (update: LevelUpdate) => {
  const { id: recordId, ...restUpdate } = update;
  const { data, error } = await supabase
    .from("levels")
    .update(restUpdate)
    .eq("id", recordId)
    .select(
      `*,
				organizations(
					id, 
					name
				),
				createdBy:employees!levels_created_by_fkey(
					id,
					employee_code,
					profiles(
						id,
						full_name,
						email
					)
				)`,
    )
    .single();

  if (error) {
    throw mapPostgrestError(error);
  }
  return data;
};
export type UpdateLevelRecord = Awaited<ReturnType<typeof updateLevel>>;

const updateStatusLevel = async (statusUpdate: LevelStatusUpdate) => {
  const { id: recordId, status } = statusUpdate;
  const { data, error } = await supabase
    .from("levels")
    .update({ status })
    .eq("id", recordId)
    .select(
      `*,
				organizations(
					id, 
					name
				),
				createdBy:employees!levels_created_by_fkey(
					id,
					employee_code,
					profiles(
						id,
						full_name,
						email
					)
				)`,
    )
    .single();

  if (error) {
    throw mapPostgrestError(error);
  }
  return data;
};
export type UpdateStatusLevelRecord = Awaited<ReturnType<typeof updateStatusLevel>>;

export type GetLevelsFilter = {
  organizationId?: string;
  from: number;
  to: number;
};
const getLevels = async (filter: GetLevelsFilter) => {
  const { from, to, organizationId } = filter;

  let query = supabase.from("levels").select(
    `	*,
				organizations(
					id, 
					name
				),
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
    { count: "exact" },
  );

  query = query.filter("status", "not.eq", "deleted");

  if (organizationId) {
    query = query.eq("organization_id", organizationId);
  }

  const { data, error, count } = await query
    .order("score_required", { ascending: false })
    .range(from, to)
    .overrideTypes<Array<{ status: "active" | "inactive" }>>();

  if (error) {
    throw mapPostgrestError(error);
  }
  return { data, count };
};
export type GetLevelsRecord = Awaited<ReturnType<typeof getLevels>>;

export { createLevel, updateLevel, updateStatusLevel, getLevels };
