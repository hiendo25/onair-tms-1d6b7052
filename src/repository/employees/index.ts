import { createClient, supabase } from "@/services";
import { createSVClient } from "@/services";
import type { EmployeeDto, GetEmployeesParams } from "@/types/dto/employees";
import type { PaginatedResult } from "@/types/dto/pagination.dto";
import { Database } from "@/types/supabase.types";

const getEmployees = async (params?: GetEmployeesParams): Promise<PaginatedResult<EmployeeDto>> => {
  const page = params?.page ?? 0;
  const limit = params?.limit ?? 12;
  const search = params?.search?.trim();
  const departmentId = params?.departmentId;
  const branchId = params?.branchId;
  const status = params?.status;
  const employeeType = params?.employeeType;
  const organizationId = params?.organizationId;

  // Determine if we need INNER joins for filtering
  const hasDepartmentFilter = departmentId && departmentId !== "all";
  const hasBranchFilter = branchId && branchId !== "all";

  // Use INNER join for junction tables when filtering to exclude employees without those relationships
  const departmentJoinType = hasDepartmentFilter ? "!inner" : "";
  const branchJoinType = hasBranchFilter ? "!inner" : "";

  // Build query using Supabase ORM with new junction tables
  // Use !inner for profiles to ensure we only get employees with valid profile data
  let query = supabase.from("employees").select(
    `
      id,
      employee_code,
      start_date,
      position_id,
      employee_type,
      user_id,
      created_at,
      status,
      profiles!inner (
        id,
        full_name,
        email,
        phone_number,
        gender,
        birthday,
        avatar
      ),
      positions (
        id,
        title
      ),
      employee_branches${branchJoinType} (
        id,
        branch_id,
        created_at,
        branches (
          id,
          name,
          code,
          address
        )
      ),
      employee_departments${departmentJoinType} (
        id,
        department_id,
        created_at,
        departments (
          id,
          name,
          branch_id
        )
      ),
      managers_employees!managers_employees_employee_id_fkey (
        manager_id
      )
    `,
    { count: "exact" },
  );

  // Apply filters
  if (status) {
    query = query.eq("status", status);
  }

  if (employeeType) {
    query = query.eq("employee_type", employeeType);
  }

  // Filter by department using junction table
  if (hasDepartmentFilter) {
    query = query.eq("employee_departments.department_id", departmentId);
  }

  // Filter by branch using junction table
  if (hasBranchFilter) {
    query = query.eq("employee_branches.branch_id", branchId);
  }

  if (organizationId) {
    query = query.eq("organization_id", organizationId);
  }

  // Search by full name in profiles
  if (search && search.length > 0) {
    query = query.ilike("profiles.full_name", `%${search}%`);
  }

  // Apply pagination
  const from = page * limit;
  const to = from + limit - 1;

  const { data, error, count } = await query.order("created_at", { ascending: false }).range(from, to);

  if (error) {
    throw new Error(`Failed to fetch employees: ${error.message}`);
  }

  return {
    data: (data as unknown as EmployeeDto[]) || [],
    total: count ?? 0,
    page,
    limit,
  };
};

const getEmployeeById = async (id: string) => {
  const { data, error } = await supabase
    .from("employees")
    .select(
      `
      id,
      employee_code,
      start_date,
      position_id,
      employee_type,
      user_id,
      created_at,
      status,
      profiles!profiles_employee_id_fkey (
        id,
        full_name,
        email,
        phone_number,
        gender,
        birthday,
        avatar
      ),
      positions (
        id,
        title
      ),
      employee_branches (
        id,
        branch_id,
        created_at,
        branches (
          id,
          name,
          code,
          address
        )
      ),
      employee_departments (
        id,
        department_id,
        created_at,
        departments (
          id,
          name,
          branch_id
        )
      ),
      managers_employees!managers_employees_employee_id_fkey (
        manager_id
      )
    `,
    )
    .eq("id", id)
    .single();

  if (error) {
    throw new Error(`Failed to fetch employee: ${error.message}`);
  }
  const { data: userRolesData, error: userRolesError } = await supabase
    .from("user_roles")
    .select("role_id")
    .eq("user_id", data?.user_id);

  if (userRolesError) {
    throw new Error(`Failed to fetch user roles: ${userRolesError.message}`);
  }

  return {
    ...data,
    role_ids: userRolesData?.map((ur) => ur.role_id) || [],
  } as unknown as EmployeeDto;
};

export async function getLastEmployeeOrder(organizationId?: string) {
  const supabase = await createSVClient();

  let query = supabase.from("employees").select("employee_order");

  if (organizationId) {
    query = query.eq("organization_id", organizationId);
  }

  const { data, error } = await query
    .order("employee_order", { ascending: false, nullsFirst: false })
    .limit(1)
    .maybeSingle();

  if (error) {
    throw new Error(`getLastEmployeeOrder: ${error.message}`);
  }

  return data?.employee_order;
}

export async function checkEmployeeCodeExists(code: string) {
  const supabase = await createSVClient();

  const { data, error } = await supabase.from("employees").select("id").eq("employee_code", code).maybeSingle();

  if (error) {
    throw new Error(error.message);
  }
  return Boolean(data);
}

export async function isExistEmployee(userId: string, organizationId: string) {
  const supabase = await createSVClient();
  const { data: employee, error } = await supabase
    .from("employees")
    .select("id")
    .eq("user_id", userId)
    .eq("organization_id", organizationId)
    .single();

  return Boolean(employee);
}

export async function createEmployee(data: {
  user_id: string;
  employee_code: string;
  employee_order: number;
  start_date: string;
  position_id?: string | null;
  employee_type: Database["public"]["Enums"]["employee_type"];
  organization_id: string;
  status: Database["public"]["Enums"]["employee_status"];
}) {
  const supabase = await createSVClient();

  const { data: employee, error } = await supabase.from("employees").insert(data).select().single();

  if (error) {
    throw new Error(`Failed to create employee: ${error.message}`);
  }

  return employee;
}

export async function updateEmployeeById(
  id: string,
  data: {
    employee_code?: string;
    start_date?: string;
    position_id?: string | null;
    employee_type?: Database["public"]["Enums"]["employee_type"];
  },
) {
  const supabase = await createSVClient();

  const { error } = await supabase.from("employees").update(data).eq("id", id);

  if (error) {
    throw new Error(`Failed to update employee: ${error.message}`);
  }
}
export async function getCurrentEmployee(userId: string, organizationId: string) {
  const supabase = await createSVClient();

  const { data: employee, error } = await supabase
    .from("employees")
    .select("id, organization_id")
    .eq("user_id", userId)
    .eq("organization_id", organizationId)
    .maybeSingle();

  if (error) {
    throw new Error(`Failed to fetch employee: ${error.message}`);
  }

  if (!employee) {
    throw new Error("Employee not found");
  }

  return employee;
}
// export async function getEmployeeByUserId(userId: string) {
//   const supabase = await createSVClient();

//   const { data: employee, error } = await supabase
//     .from("employees")
//     .select("id, organization_id")
//     .eq("user_id", userId)
//     .single();

//   if (error) {
//     throw new Error(`Failed to fetch employee: ${error.message}`);
//   }

//   if (!employee) {
//     throw new Error("Employee not found");
//   }

//   return employee;
// }

export async function getEmployeeUserId(employeeId: string) {
  const supabase = await createSVClient();

  const { data: employee, error } = await supabase.from("employees").select("user_id").eq("id", employeeId).single();

  if (error) {
    throw new Error(`Failed to fetch employee: ${error.message}`);
  }

  if (!employee) {
    throw new Error("Employee not found");
  }

  return employee.user_id;
}

export async function deleteEmployeeById(employeeId: string) {
  const supabase = await createSVClient();

  const { error } = await supabase.from("employees").delete().eq("id", employeeId);

  if (error) {
    throw new Error(`Failed to delete employee: ${error.message}`);
  }
}

export async function findEmployeesByEmployeeCodes(employeeCodes: string[]) {
  const supabase = await createSVClient();

  const { data, error } = await supabase.from("employees").select("employee_code").in("employee_code", employeeCodes);

  if (error) {
    throw new Error(`Failed to check employee codes: ${error.message}`);
  }

  return data || [];
}

export async function getEmployeeOrganizationIdByUserId(userId: string): Promise<string> {
  const supabase = await createSVClient();

  const { data: employee, error } = await supabase
    .from("employees")
    .select("organization_id")
    .eq("user_id", userId)
    .single();

  if (error) {
    throw new Error(`Failed to fetch employee organization: ${error.message}`);
  }

  if (!employee?.organization_id) {
    throw new Error("Employee organization not found");
  }

  return employee.organization_id;
}

export const getEmployeesByUserId = async (userId: string) => {
  try {
    const supabase = createClient();
    const { data, error } = await supabase
      .from("employees")
      .select(
        `
				id, 
				status, 
				employee_code, 
				employee_type,
				user_id,
				organization:organizations!inner(
					id, 
					name, 
					subdomain, 
					employee_limit, 
					subdomain,
					logo,
					is_active,
					favicon,
					shortname
				),
				positions(
					id,
					title, 
					organization_id
				),
				profiles(
					id,
					full_name,
					gender,
					avatar,
					email
				)
			`,
      )
      .eq("user_id", userId);

    if (error) {
      console.log(error);
      throw new Error(error.message);
    }
    return data;
  } catch (err) {
    console.error(err);
    throw new Error("Can't get employees Info");
  }
};
export type GetEmployeesByUserIdResponse = Awaited<ReturnType<typeof getEmployeesByUserId>>;

const getOneEmployee = async (variables: { userId: string; organizationId: string }) => {
  const { userId, organizationId } = variables;
  try {
    const supabase = createClient();
    const { data, error } = await supabase
      .from("employees")
      .select(
        `
				id, 
				status, 
				employee_code, 
				employee_type,
				user_id,
				organization_id,
				organization:organizations!inner(
					id, 
					name, 
					subdomain, 
					employee_limit, 
					subdomain,
					logo,
					is_active,
					favicon,
					shortname
				),
				profiles(
					id,
					full_name,
					gender,
					avatar,
					email
				)
			`,
      )
      .eq("user_id", userId)
      .eq("organization_id", organizationId)
      .maybeSingle();
    if (error) {
      throw new Error(error?.message);
    }
    return data;
  } catch (err) {
    console.log(err);
    throw new Error("Can't getOneEmployee");
  }
};
export type getOneEmployee = Awaited<ReturnType<typeof getOneEmployee>>;

const updateStatus = async (employeeId: string, status: "active" | "inactive") => {
  const supabase = createClient();
  return await supabase
    .from("employees")
    .update({ status })
    .select(
      `
				id, 
				status, 
				employee_code, 
				employee_type,
				user_id,
				organization_id,
				organization:organizations!inner(
					id, 
					name, 
					subdomain, 
					employee_limit, 
					subdomain,
					logo,
					is_active,
					favicon,
					shortname
				),
				profiles(
					id,
					full_name,
					gender,
					avatar,
					email
				)
			`,
    )
    .eq("id", employeeId)
    .single();
};
export type UpdateStatusResponse = Awaited<ReturnType<typeof updateStatus>>;

export async function getEmployeesByEmailsAndOrganizationId(emails: string[], organizationId: string) {
  const supabase = await createSVClient();
  const { data: employee, error } = await supabase.rpc("get_employees_by_emails_and_organization", {
    p_emails: emails,
    p_organization_id: organizationId,
  });

  if (error) {
    console.error(error);
    throw new Error(`Failed to fetch employee: ${error.message}`);
  }

  return employee;
}

export async function getEmployeesByCodesAndOrganizationId(codes: string[], organizationId: string) {
  const supabase = await createSVClient();

  const { data: employee, error } = await supabase.rpc("get_employees_by_codes_and_organization", {
    p_codes: codes,
    p_organization_id: organizationId,
  });

  if (error) {
    console.error(error);
    throw new Error(`Failed to fetch employee: ${error.message}`);
  }

  return employee;
}

export async function getEmployeeIdByUserIdAndOrganizationId(userId: string, organizationId: string) {
  const supabase = await createSVClient();

  const { data: employee, error } = await supabase
    .from("employees")
    .select("id, organization_id, employee_code")
    .eq("user_id", userId)
    .eq("organization_id", organizationId)
    .maybeSingle();

  if (error) {
    console.error(error);
    throw new Error(error.details || error.message);
  }

  return employee;
}

export { getEmployees, getEmployeeById, getOneEmployee, updateStatus };
