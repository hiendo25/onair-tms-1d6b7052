import { mapPostgrestError } from "@/lib/errors/map-postgrest-error";
import { createSVClient } from "@/services";

import { LevelInsert, LevelStatusUpdate, LevelUpdate } from "./level.type";
export async function createLevel(insert: LevelInsert) {
  const supabaseSv = await createSVClient();
  const { data, error } = await supabaseSv
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
    console.error(error);
    throw new Error(error.details || error.message);
  }
  return data;
}
export type CreateLevelRecord = Awaited<ReturnType<typeof createLevel>>;

export async function updateLevel(update: LevelUpdate) {
  const supabaseSv = await createSVClient();
  const { id: recordId, ...restUpdate } = update;
  const { data, error } = await supabaseSv
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
    console.error(error);
    throw new Error(error.details || error.message);
  }
  return data;
}
export type UpdateLevelRecord = Awaited<ReturnType<typeof updateLevel>>;

export async function updateStatusLevel(statusUpdate: LevelStatusUpdate) {
  const supabaseSv = await createSVClient();
  const { id: recordId, status } = statusUpdate;
  const { data, error } = await supabaseSv
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
    console.error(error);
    throw new Error(error.details || error.message);
  }
  return data;
}
export type UpdateStatusLevelRecord = Awaited<ReturnType<typeof updateStatusLevel>>;

export type GetLevelsFilter = {
  organizationId?: string;
  from: number;
  to: number;
};

export async function getLevels(filter: GetLevelsFilter) {
  const supabaseSv = await createSVClient();
  const { from, to, organizationId } = filter;

  let query = supabaseSv.from("levels").select(
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
    console.error(error);
    throw new Error(error.details || error.message);
  }
  return { data, count };
}

export type GetLevelsRecord = Awaited<ReturnType<typeof getLevels>>;

export async function getLevelsByScore(score: number, organizationId: string) {
  const supabaseSv = await createSVClient();
  let query = supabaseSv.from("levels").select(
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
  );

  query = query.filter("status", "not.eq", "deleted");

  if (organizationId) {
    query = query.eq("organization_id", organizationId);
  }

  query = query.eq("score_required", score);

  const { data, error, count } = await query
    .order("score_required", { ascending: false })
    .overrideTypes<Array<{ status: "active" | "inactive" }>>();

  if (error) {
    console.error(error);
    throw new Error(error.details || error.message);
  }
  return data;
}
