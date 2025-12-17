import { createSVClient } from "@/services";

type EmployeeBranchInsert = {
  employee_id: string;
  branch_id: string;
};

/**
 * Create employee-branch relationships
 */
export async function create(data: EmployeeBranchInsert[]): Promise<void> {
  const supabase = await createSVClient();

  const { error } = await supabase
    .from("employee_branches")
    .insert(data);

  if (error) {
    throw new Error(`Failed to create employee-branch relationships: ${error.message}`);
  }
}

/**
 * Delete all employee-branch relationships for a specific employee
 */
export async function deleteByEmployeeId(employeeId: string): Promise<void> {
  const supabase = await createSVClient();

  const { error } = await supabase
    .from("employee_branches")
    .delete()
    .eq("employee_id", employeeId);

  if (error) {
    throw new Error(`Failed to delete employee-branch relationships: ${error.message}`);
  }
}

/**
 * Delete all employee-branch relationships for a specific branch
 */
export async function deleteByBranchId(branchId: string): Promise<void> {
  const supabase = await createSVClient();

  const { error } = await supabase
    .from("employee_branches")
    .delete()
    .eq("branch_id", branchId);

  if (error) {
    throw new Error(`Failed to delete employee-branch relationships: ${error.message}`);
  }
}

/**
 * Delete a specific employee-branch relationship
 */
export async function deleteById(id: string): Promise<void> {
  const supabase = await createSVClient();

  const { error } = await supabase
    .from("employee_branches")
    .delete()
    .eq("id", id);

  if (error) {
    throw new Error(`Failed to delete employee-branch relationship: ${error.message}`);
  }
}

/**
 * Get all branches for an employee
 */
export async function getBranchesByEmployeeId(employeeId: string) {
  const supabase = await createSVClient();

  const { data, error } = await supabase
    .from("employee_branches")
    .select(`
      id,
      branch_id,
      created_at,
      branches (
        id,
        name,
        code,
        address
      )
    `)
    .eq("employee_id", employeeId);

  if (error) {
    throw new Error(`Failed to fetch employee branches: ${error.message}`);
  }

  return data || [];
}

/**
 * Get all employees for a branch
 */
export async function getEmployeesByBranchId(branchId: string) {
  const supabase = await createSVClient();

  const { data, error } = await supabase
    .from("employee_branches")
    .select(`
      id,
      employee_id,
      created_at,
      employees (
        id,
        employee_code,
        profiles (
          full_name,
          email
        )
      )
    `)
    .eq("branch_id", branchId);

  if (error) {
    throw new Error(`Failed to fetch branch employees: ${error.message}`);
  }

  return data || [];
}

/**
 * Check if an employee belongs to a specific branch
 */
export async function checkEmployeeBranchExists(employeeId: string, branchId: string): Promise<boolean> {
  const supabase = await createSVClient();

  const { data, error } = await supabase
    .from("employee_branches")
    .select("id")
    .eq("employee_id", employeeId)
    .eq("branch_id", branchId)
    .limit(1)
    .maybeSingle();

  if (error) {
    throw new Error(`Failed to check employee-branch relationship: ${error.message}`);
  }

  return !!data;
}

