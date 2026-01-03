import { supabase } from "@/services";
export type EmployeeQueryParams = {
  page?: number;
  pageSize?: number;
  excludes?: string[];
  search?: string;
  departmentIds?: string[];
  branchIds?: string[];
  organizationId: string;
};

export type GetStudentsQueryParams = {
  page?: number;
  pageSize?: number;
  excludes?: string[];
  search?: {
    key: "full_name" | "code" | "email";
    search: string;
  };
  departmentIds?: string[];
  branchIds?: string[];
  organizationId?: string;
};

const getStudents = async (queryParams?: GetStudentsQueryParams) => {
  const { page = 1, pageSize = 20, excludes, search, departmentIds, branchIds, organizationId } = queryParams || {};
  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;

  let studentQuery = supabase
    .from("employees")
    .select(
      `id,
      employee_code,
      status,
      created_at,
      employee_type,
      profiles!inner(
        id,
        full_name,
        gender,
        avatar,
        email,
				employee_id
      ),
      employee_departments!inner(
        id,
        department_id,
        departments(
          id,
          name,
          branch_id
        )
      ),
      employee_branches!inner(
        id,
        branch_id,
        branches(
          id,
          name
        )
      )
    `,
      {
        count: "exact",
      },
    )
    .eq("employee_type", "student");

  if (organizationId) {
    studentQuery = studentQuery.eq("organization_id", organizationId);
  }

  if (departmentIds?.length) {
    studentQuery = studentQuery.filter("employee_departments.department_id", "in", `(${departmentIds.join(",")})`);
  }

  if (branchIds?.length) {
    studentQuery = studentQuery.filter("employee_branches.branch_id", "in", `(${branchIds.join(",")})`);
  }

  if (excludes?.length) {
    studentQuery = studentQuery.not("id", "in", `(${excludes.join(",")})`);
  }
  if (search && search.search) {
    const keysMap = {
      full_name: "profiles.full_name ",
      code: "employee_code",
      email: "profiles.email",
    };
    const keyName = keysMap[search.key];
    const keyword = `%${search.search}%`;
    studentQuery = studentQuery.ilike(keyName, `${keyword}`);
  }

  return await studentQuery
    .order("created_at", { ascending: false })
    .range(from, to)
    .overrideTypes<Array<{ employee_type: "student" }>>();
};
export type GetStudentsResponse = Awaited<ReturnType<typeof getStudents>>;
export { getStudents };
