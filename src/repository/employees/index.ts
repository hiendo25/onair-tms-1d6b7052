import { supabase } from "@/services";
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

  // Check if we have organization unit filters
  const hasDepartmentFilter = departmentId && departmentId !== "all";
  const hasBranchFilter = branchId && branchId !== "all";
  const hasAnyFilter = hasDepartmentFilter || hasBranchFilter || (search && search.length > 0);

  // Use RPC function for efficient server-side filtering
  if (hasAnyFilter) {
    // Call the PostgreSQL RPC function to get filtered employee IDs
    const { data: rpcResult, error: rpcError } = await supabase.rpc("get_filtered_employees", {
      p_page: page,
      p_limit: limit,
      p_search: search || undefined,
      p_department_id: hasDepartmentFilter ? departmentId : undefined,
      p_branch_id: hasBranchFilter ? branchId : undefined,
    });

    if (rpcError) {
      throw new Error(`Failed to filter employees: ${rpcError.message}`);
    }

    // Extract employee IDs and total count from RPC result
    const employeeIds = rpcResult?.map((row: any) => row.employee_id) || [];
    const totalCount = rpcResult?.[0]?.total_count || 0;

    if (employeeIds.length === 0) {
      return {
        data: [],
        total: totalCount,
        page,
        limit,
      };
    }

    // Fetch full employee data for the filtered IDs
    // Use LEFT JOIN for employments to get ALL employment records
    let employeeQuery = supabase
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
        employments (
          id,
          organization_unit_id,
          organization_units!employments_organization_unit_id_fkey (
            id,
            name,
            type
          )
        ),
        managers_employees!managers_employees_employee_id_fkey (
          manager_id
        )
      `,
      )
      .in("id", employeeIds);

    if (status) {
      employeeQuery = employeeQuery.eq("status", status);
    }

    const { data: fullEmployeeData, error: dataError } = await employeeQuery.order("created_at", { ascending: false });

    if (dataError) {
      throw new Error(`Failed to fetch employee data: ${dataError.message}`);
    }

    return {
      data: (fullEmployeeData as unknown as EmployeeDto[]) || [],
      total: totalCount,
      page,
      limit,
    };
  }

  // No filters - use simple query with LEFT JOIN
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
      employments (
        id,
        organization_unit_id,
        organization_units!employments_organization_unit_id_fkey (
          id,
          name,
          type
        )
      ),
      managers_employees!managers_employees_employee_id_fkey (
        manager_id
      )
    `,
    { count: "exact" },
  );

  // Apply status filter if present
  if (status) {
    query = query.eq("status", status);
  }

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
      employments (
        id,
        organization_unit_id,
        organization_units!employments_organization_unit_id_fkey (
          id,
          name,
          type
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

export async function getLastEmployeeOrder() {
  const supabase = await createSVClient();

  const { data: lastEmployee, error: orderError } = await supabase
    .from("employees")
    .select("employee_order")
    .order("employee_order", { ascending: false, nullsFirst: false })
    .limit(1)
    .single();

  if (orderError && orderError.code !== "PGRST116") {
    throw new Error(`Failed to get last employee order: ${orderError.message}`);
  }

  return lastEmployee?.employee_order ?? 0;
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

export async function getEmployeeByUserId(userId: string) {
  const supabase = await createSVClient();

  const { data: employee, error } = await supabase
    .from("employees")
    .select("id, organization_id")
    .eq("user_id", userId)
    .single();

  if (error) {
    throw new Error(`Failed to fetch employee: ${error.message}`);
  }

  if (!employee) {
    throw new Error("Employee not found");
  }

  return employee;
}

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

export const getEmployeeDetailByUserId = async (userId: string) => {
  try {
    const supabase = await createSVClient();
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
				organizations(
					id, 
					name, 
					subdomain, 
					employee_limit, 
					subdomain
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
      .eq("user_id", userId)
      .maybeSingle();

    if (error) {
      console.log(error);
      throw new Error(error.message);
    }
    return data;
  } catch (err) {
    console.log(err);
    throw new Error("Can't get user Info");
  }
};
export type GetEmployeeDetailByUserIdResponse = Awaited<ReturnType<typeof getEmployeeDetailByUserId>>;

export { getEmployees, getEmployeeById };
