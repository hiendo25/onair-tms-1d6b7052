import { supabase } from "@/services";
export interface GetTeacherQueryParams {
  page?: number;
  pageSize?: number;
  search?: string;
  exclude?: string[];
  organizationId?: string;
}

const getTeacherList = async (queryParams?: GetTeacherQueryParams) => {
  const { page = 1, pageSize = 20, search = "", exclude, organizationId } = queryParams || {};
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
			organization_id,
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
  if (organizationId) {
    teacherQuery = teacherQuery.eq("organization_id", organizationId);
  }

  const { data, error, count, status, statusText } = await teacherQuery
    .order("created_at", { ascending: false })
    .range(from, to)
    .overrideTypes<
      Array<{
        employee_type: "teacher";
      }>
    >();

  if (error) throw error;

  return {
    data,
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
