import { createSVClient } from "@/services";

type EmployeeDepartmentInsert = {
  employee_id: string;
  department_id: string;
};

/**
 * Create employee-department relationships
 */
export async function create(data: EmployeeDepartmentInsert[]): Promise<void> {
  const supabase = await createSVClient();

  const { error } = await supabase
    .from("employee_departments")
    .insert(data);

  if (error) {
    throw new Error(`Failed to create employee-department relationships: ${error.message}`);
  }
}

/**
 * Delete all employee-department relationships for a specific employee
 */
export async function deleteByEmployeeId(employeeId: string): Promise<void> {
  const supabase = await createSVClient();

  const { error } = await supabase
    .from("employee_departments")
    .delete()
    .eq("employee_id", employeeId);

  if (error) {
    throw new Error(`Failed to delete employee-department relationships: ${error.message}`);
  }
}

/**
 * Delete all employee-department relationships for a specific department
 */
export async function deleteByDepartmentId(departmentId: string): Promise<void> {
  const supabase = await createSVClient();

  const { error } = await supabase
    .from("employee_departments")
    .delete()
    .eq("department_id", departmentId);

  if (error) {
    throw new Error(`Failed to delete employee-department relationships: ${error.message}`);
  }
}

/**
 * Delete a specific employee-department relationship
 */
export async function deleteById(id: string): Promise<void> {
  const supabase = await createSVClient();

  const { error } = await supabase
    .from("employee_departments")
    .delete()
    .eq("id", id);

  if (error) {
    throw new Error(`Failed to delete employee-department relationship: ${error.message}`);
  }
}

/**
 * Get all departments for an employee
 */
export async function getDepartmentsByEmployeeId(employeeId: string) {
  const supabase = await createSVClient();

  const { data, error } = await supabase
    .from("employee_departments")
    .select(`
      id,
      department_id,
      created_at,
      departments (
        id,
        name,
        branch_id
      )
    `)
    .eq("employee_id", employeeId);

  if (error) {
    throw new Error(`Failed to fetch employee departments: ${error.message}`);
  }

  return data || [];
}

/**
 * Get all employees for a department
 */
export async function getEmployeesByDepartmentId(departmentId: string) {
  const supabase = await createSVClient();

  const { data, error } = await supabase
    .from("employee_departments")
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
    .eq("department_id", departmentId);

  if (error) {
    throw new Error(`Failed to fetch department employees: ${error.message}`);
  }

  return data || [];
}

/**
 * Check if an employee belongs to a specific department
 */
export async function checkEmployeeDepartmentExists(employeeId: string, departmentId: string): Promise<boolean> {
  const supabase = await createSVClient();

  const { data, error } = await supabase
    .from("employee_departments")
    .select("id")
    .eq("employee_id", employeeId)
    .eq("department_id", departmentId)
    .limit(1)
    .maybeSingle();

  if (error) {
    throw new Error(`Failed to check employee-department relationship: ${error.message}`);
  }

  return !!data;
}

