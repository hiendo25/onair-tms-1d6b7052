import { supabase } from "@/services";
import { createSVClient } from "@/services";

interface GetOrganizationUnitsByOrgParams {
  organizationId?: string;
  type?: "department" | "branch";
  search?: string;
  page?: number;
  limit?: number;
}

export const getOrganizationUnitsByOrg = async ({
                                                  organizationId,
                                                  type,
                                                  search,
                                                  page = 1,
                                                  limit = 10,
                                                }: GetOrganizationUnitsByOrgParams) => {
  if (!organizationId) {
    return { data: [], total: 0, page, limit };
  }

  const from = (page - 1) * limit;
  const to = from + limit - 1;

  // Fetch from branches and/or departments tables based on type parameter
  if (type === "branch") {
    // Query only branches
    let query = supabase
      .from("branches")
      .select("id, name, organization_id", { count: "exact" })
      .eq("organization_id", organizationId)
      .order("name", { ascending: true })
      .range(from, to);

    if (search) {
      query = query.ilike("name", `%${search}%`);
    }

    const { data, error, count } = await query;
    if (error) throw new Error(error.message);

    return {
      data: (data || []).map((item) => ({
        id: item.id,
        name: item.name,
        type: "branch" as const,
      })),
      total: count || 0,
      page,
      limit,
    };
  } else if (type === "department") {
    // Query only departments
    let query = supabase
      .from("departments")
      .select("id, name, organization_id", { count: "exact" })
      .eq("organization_id", organizationId)
      .order("name", { ascending: true })
      .range(from, to);

    if (search) {
      query = query.ilike("name", `%${search}%`);
    }

    const { data, error, count } = await query;
    if (error) throw new Error(error.message);

    return {
      data: (data || []).map((item) => ({
        id: item.id,
        name: item.name,
        type: "department" as const,
      })),
      total: count || 0,
      page,
      limit,
    };
  } else {
    // Fetch both branches and departments when no type is specified
    // Note: This is more complex with pagination, so we'll fetch both and combine
    const [branchesResult, departmentsResult] = await Promise.all([
      supabase
        .from("branches")
        .select("id, name, organization_id", { count: "exact" })
        .eq("organization_id", organizationId)
        .ilike("name", search ? `%${search}%` : "%")
        .order("name", { ascending: true }),
      supabase
        .from("departments")
        .select("id, name, organization_id", { count: "exact" })
        .eq("organization_id", organizationId)
        .ilike("name", search ? `%${search}%` : "%")
        .order("name", { ascending: true }),
    ]);

    if (branchesResult.error) throw new Error(branchesResult.error.message);
    if (departmentsResult.error) throw new Error(departmentsResult.error.message);

    // Combine and add type field
    const branches = (branchesResult.data || []).map(b => ({ ...b, type: "branch" as const }));
    const departments = (departmentsResult.data || []).map(d => ({ ...d, type: "department" as const }));

    // Combine and sort by name
    const combined = [...branches, ...departments].sort((a, b) => a.name.localeCompare(b.name));

    // Apply pagination to combined results
    const paginatedData = combined.slice(from, from + limit);
    const totalCount = (branchesResult.count || 0) + (departmentsResult.count || 0);

    return {
      data: paginatedData.map((item) => ({
        id: item.id,
        name: item.name,
        type: item.type,
      })),
      total: totalCount,
      page,
      limit,
    };
  }
};

export async function getOrganizationUnitsByOrganizationId(organizationId: string) {
  const supabase = await createSVClient();

  // Fetch from both branches and departments tables
  const [branchesResult, departmentsResult] = await Promise.all([
    supabase
      .from("branches")
      .select("id, name, organization_id")
      .eq("organization_id", organizationId),
    supabase
      .from("departments")
      .select("id, name, organization_id")
      .eq("organization_id", organizationId),
  ]);

  if (branchesResult.error) {
    throw new Error(`Failed to fetch branches: ${branchesResult.error.message}`);
  }

  if (departmentsResult.error) {
    throw new Error(`Failed to fetch departments: ${departmentsResult.error.message}`);
  }

  // Combine and add type field for backwards compatibility
  const branches = (branchesResult.data || []).map(b => ({ ...b, type: "branch" as const }));
  const departments = (departmentsResult.data || []).map(d => ({ ...d, type: "department" as const }));

  return [...branches, ...departments];
}

export const getOrganizationDepartmentOrBranch = async (type?: "department" | "branch") => {
  try {
    if (type === "branch") {
      // Query branches table
      const result = await supabase.from("branches").select(`
        id,
        name,
        organization_id
      `);

      // Add type field and parent_id as null for backwards compatibility
      if (result.data) {
        result.data = result.data.map(item => ({
          ...item,
          type: "branch" as const,
          parent_id: null,
        }));
      }

      return result;
    } else if (type === "department") {
      // Query departments table
      const result = await supabase.from("departments").select(`
        id,
        name,
        branch_id,
        organization_id
      `);

      // Add type field and map branch_id to parent_id for backwards compatibility
      if (result.data) {
        result.data = result.data.map(item => ({
          ...item,
          type: "department" as const,
          parent_id: item.branch_id,
        }));
      }

      return result;
    } else {
      // Fetch both if no type specified
      const [branchesResult, departmentsResult] = await Promise.all([
        supabase.from("branches").select("id, name, organization_id"),
        supabase.from("departments").select("id, name, branch_id, organization_id"),
      ]);

      const branches = (branchesResult.data || []).map(b => ({
        ...b,
        type: "branch" as const,
        parent_id: null,
      }));

      const departments = (departmentsResult.data || []).map(d => ({
        ...d,
        type: "department" as const,
        parent_id: d.branch_id,
      }));

      return {
        data: [...branches, ...departments],
        error: branchesResult.error || departmentsResult.error,
      };
    }
  } catch (err) {
    throw new Error("Get department/branch Error");
  }
};
