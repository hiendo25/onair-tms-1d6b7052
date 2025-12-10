import { supabase } from "@/services";
import { createSVClient } from "@/services";

const getOrganizationUnits = async () => {
  const response = await supabase.from("organization_units").select("*");

  return response.data;
};

interface GetOrganizationUnitsByOrgParams {
  organizationId?: string;
  type?: "department" | "branch";
  search?: string;
  page?: number;
  limit?: number;
}

const getOrganizationUnitsByOrg = async ({
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

  let query = supabase
    .from("organization_units")
    .select("id, name, type, organization_id", { count: "exact" })
    .eq("organization_id", organizationId)
    .order("name", { ascending: true })
    .range(from, to);

  if (type) {
    query = query.eq("type", type);
  }

  if (search) {
    query = query.ilike("name", `%${search}%`);
  }

  const { data, error, count } = await query;
  if (error) throw new Error(error.message);

  return {
    data: (data || []).map((item) => ({
      id: item.id,
      name: item.name,
      type: item.type,
    })),
    total: count || 0,
    page,
    limit,
  };
};

export async function getAllOrganizationUnitsWithDetails() {
  const supabase = await createSVClient();

  const { data, error } = await supabase.from("organization_units").select("id, name, type");

  if (error) {
    throw new Error(`Failed to fetch organization units: ${error.message}`);
  }

  return data || [];
}

export async function getOrganizationUnitsByOrganizationId(organizationId: string) {
  const supabase = await createSVClient();

  const { data, error } = await supabase
    .from("organization_units")
    .select("id, name, type, organization_id")
    .eq("organization_id", organizationId);

  if (error) {
    throw new Error(`Failed to fetch organization units: ${error.message}`);
  }

  return data || [];
}

export const getOrganizationDepartmentOrBranch = async (type?: "department" | "branch") => {
  try {
    let organizationQuery = supabase.from("organization_units").select(
      `
        id,
        name,
        parent_id,
        type
      `,
    );
    if (type) {
      organizationQuery = organizationQuery.eq("type", type);
    }
    return await organizationQuery;
  } catch (err) {
    throw new Error("Get department Error");
  }
};
export { getOrganizationUnits };
export { getOrganizationUnitsByOrg };
