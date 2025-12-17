import { supabase } from "@/services";
import { EmployeeStudentWithProfileItem } from "@/model/employee.model";
export type EmployeeQueryParams = {
  page?: number;
  pageSize?: number;
  excludes?: string[];
  search?: string;
  departmentIds?: string[];
  branchIds?: string[];
};

export type GetStudentsQueryParams = {
  page?: number;
  pageSize?: number;
  excludes?: string[];
  search?: string;
  departmentIds?: string[];
  branchIds?: string[];
};

const getStudents = async (queryParams?: GetStudentsQueryParams) => {
  const { page = 1, pageSize = 20, excludes, search, departmentIds, branchIds } = queryParams || {};
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
        email
      ),
      employee_departments(
        id,
        department_id,
        departments(
          id,
          name,
          branch_id
        )
      ),
      employee_branches(
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

  if (departmentIds?.length) {
    studentQuery = studentQuery.in("employee_departments.department_id", departmentIds);
  }

  if (branchIds?.length) {
    studentQuery = studentQuery.in("employee_branches.branch_id", branchIds);
  }

  if (excludes?.length) {
    studentQuery = studentQuery.not("id", "in", `(${excludes.join(",")})`);
  }
  if (search) {
    studentQuery = studentQuery.ilike("profiles.full_name", `%${search}%`);
  }

  const { data, error, count, status, statusText } = await studentQuery
    .order("created_at", { ascending: false })
    .range(from, to);

  return {
    data: data as EmployeeStudentWithProfileItem[],
    count,
    error,
    status,
    statusText,
  };
};
export type GetStudentsResponse = Awaited<ReturnType<typeof getStudents>>;
export { getStudents };
