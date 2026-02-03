import { createSVClient } from "@/services";

import { branchSelector, createdBySelector, managedBySelector } from "./selector";
import { DepartmentFilter, DepartmentInsert, DepartmentUpdate, DepartmentUpdateStatus } from "./type";

export async function createDepartment(departmentInsert: DepartmentInsert) {
  const supabase = await createSVClient();

  const { data, error } = await supabase
    .from("departments")
    .insert(departmentInsert)
    .select(
      `
			*, 
			${createdBySelector},
			${managedBySelector},
			${branchSelector},
			organizations(id, name, code)
			`,
    )
    .single();

  if (error) {
    throw new Error(error.details || error.message);
  }

  return data;
}

export async function updateDepartment({ id, ...departmentUpdate }: DepartmentUpdate) {
  const supabase = await createSVClient();

  const { data, error } = await supabase
    .from("departments")
    .update(departmentUpdate)
    .eq("id", id)
    .select(
      `*, 
			${createdBySelector},
			${managedBySelector}, 
			${branchSelector},
			organizations(id, name, code)`,
    )
    .single();

  if (error) {
    throw new Error(error.details || error.message);
  }

  return data;
}

export async function updateDepartmentStatus({ id, ...branchUpdateStatus }: DepartmentUpdateStatus) {
  const supabase = await createSVClient();

  const { data, error } = await supabase
    .from("departments")
    .update(branchUpdateStatus)
    .eq("id", id)
    .select(
      `*, 
			${createdBySelector},
			${managedBySelector},
			${branchSelector},
			organizations(id, name, code)`,
    )
    .single();

  if (error) {
    throw new Error(error.details || error.message);
  }

  return data;
}

export async function getRootDepartments(departmentFilter: DepartmentFilter) {
  const { from = 0, to = 90, filterField, filterValue, organizationId, excludes } = departmentFilter;

  const supabaseSv = await createSVClient();

  let query = supabaseSv
    .from("departments")
    .select(
      `*, 
			${createdBySelector},
			${managedBySelector},
			${branchSelector},
			organizations(id, name, code)
			`,
      {
        count: "exact",
      },
    )
    .eq("organization_id", organizationId)
    .is("parent_id", null);

  const filterMap = {
    code: "code",
    name: "name",
  };

  if (filterField && filterValue) {
    query = query.ilike(filterMap[filterField], `%${filterValue}%`);
  }

  if (excludes && excludes.length) {
    query = query.not("id", "in", `(${excludes.join(",")})`);
  }

  const { data, error, count } = await query.range(from, to).order("created_at", { ascending: false });

  if (error) {
    throw new Error(error.details || error.message);
  }

  return { data, count };
}
export type GetRootDepartmentsRecords = Awaited<ReturnType<typeof getRootDepartments>>;

/**
 *
 * @param parentId
 * @returns return the last of list in parent department
 */
export async function getLastPriorityDepartment(parentId?: string) {
  const supabase = await createSVClient();

  let query = supabase.from("departments").select("priority").order("priority", { ascending: false }).limit(1);

  if (parentId) {
    query = query.eq("parent_id", parentId);
  } else {
    query = query.is("parent_id", null);
  }

  const { data, error } = await query.maybeSingle();

  if (error) {
    throw new Error(error?.details || error.message);
  }
  return data?.priority || 0;
}

export async function getDepartmentByCodeOrName(type: "code" | "name", value: string) {
  const supabase = await createSVClient();

  const { data, error } = await supabase
    .from("departments")
    .select(
      `*,
			${createdBySelector},
			${managedBySelector},
			${branchSelector},
			organizations(id, name, code)`,
    )
    .eq(type, value)
    .maybeSingle();

  if (error) {
    throw new Error(error.details || error.message);
  }

  return data;
}

export async function getDepartmentById(departmentId: string, organizationId?: string) {
  const supabase = await createSVClient();
  let query = supabase
    .from("departments")
    .select(
      `
			*,
			${createdBySelector},
			${managedBySelector},
			${branchSelector},
			organizations(id, name, code)
		`,
    )
    .eq("id", departmentId);

  if (organizationId) {
    query = query.eq("organization_id", organizationId);
  }
  const { data, error } = await query.limit(1).maybeSingle();

  if (error) {
    throw new Error(error?.details || error.message);
  }

  return data;
}
export type GetDepartmentById = Awaited<ReturnType<typeof getDepartmentById>>;

export async function getDepartmentsByPaths(paths: string[]) {
  const supabaseSv = await createSVClient();

  let query = supabaseSv.from("departments").select(
    `*, 
			${createdBySelector},
			${managedBySelector},
			${branchSelector},
			organizations(id, name, code)
		`,
    {
      count: "exact",
    },
  );

  if (paths.length) {
    const orConditions = paths.map((path) => `path.ilike.${path}%`).join(",");

    query = query.or(orConditions);
  }

  const { data, error, count } = await query.order("path");

  if (error) {
    throw new Error(error.details || error.message);
  }

  return data;
}
export type GetDepartmentsByPathsRecords = Awaited<ReturnType<typeof getDepartmentsByPaths>>;
