import { supabase } from "@/services";
import { createSVClient } from "@/services";

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
      .eq("organization_id", organizationId)
  ]);

  if (branchesResult.error) {
    throw new Error(`Failed to fetch branches: ${branchesResult.error.message}`);
  }

  if (departmentsResult.error) {
    throw new Error(`Failed to fetch departments: ${departmentsResult.error.message}`);
  }

  // Combine and add type field for backwards compatibility
  const branches = (branchesResult.data || []).map(b => ({ ...b, type: 'branch' as const }));
  const departments = (departmentsResult.data || []).map(d => ({ ...d, type: 'department' as const }));

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
          type: 'branch' as const,
          parent_id: null
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
          type: 'department' as const,
          parent_id: item.branch_id
        }));
      }

      return result;
    } else {
      // Fetch both if no type specified
      const [branchesResult, departmentsResult] = await Promise.all([
        supabase.from("branches").select("id, name, organization_id"),
        supabase.from("departments").select("id, name, branch_id, organization_id")
      ]);

      const branches = (branchesResult.data || []).map(b => ({
        ...b,
        type: 'branch' as const,
        parent_id: null
      }));

      const departments = (departmentsResult.data || []).map(d => ({
        ...d,
        type: 'department' as const,
        parent_id: d.branch_id
      }));

      return {
        data: [...branches, ...departments],
        error: branchesResult.error || departmentsResult.error
      };
    }
  } catch (err) {
    throw new Error("Get department/branch Error");
  }
};
