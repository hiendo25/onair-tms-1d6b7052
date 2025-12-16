import { supabase } from "@/services";
import { EmployeeTeacherTypeItem } from "@/model/employee.model";
export interface GetTeacherQueryParams {
  page?: number;
  pageSize?: number;
  search?: string;
  exclude?: string[];
}

const getTeacherList = async (queryParams?: GetTeacherQueryParams) => {
  const { page = 1, pageSize = 20, search = "", exclude } = queryParams || {};
  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;

  const excludeStr = exclude ? exclude.join(",") : "";

  let teacherQuery = supabase
    .from("employees")
    .select(
      `
      id,
      employee_code,
      status,
      employee_type,
      profiles!inner(
        id,
        full_name,
        phone_number,
        birthday,
        email,
        avatar,
        gender
      ),
      employee_departments(
        id,
        department_id,
        departments(
          id,
          name,
          branch_id,
          branches(
            id,
            name
          )
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
      { count: "exact" },
    )
    .eq("employee_type", "teacher");

  if (exclude?.length) {
    teacherQuery = teacherQuery.not("id", "in", `(${excludeStr})`);
  }
  if (search) {
    teacherQuery = teacherQuery.ilike("profiles.full_name", `%${search}%`);
  }

  const { data, error, count, status, statusText } = await teacherQuery
    .order("created_at", { ascending: false })
    .range(from, to);

  if (error) throw error;

  return {
    data: data as EmployeeTeacherTypeItem[],
    count,
    status,
    statusText,
  };
};

export type GetTeacherListResponse = Awaited<ReturnType<typeof getTeacherList>>;

const getTeacherById = async (id: string) => {
  return await supabase.from("employees").select("*").match({ id }).limit(1).single();
};

export { getTeacherList, getTeacherById };
