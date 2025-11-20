import { createSVClient } from "@/services";

export const getEmployeeDetailInfoByUserId = async (userId: string) => {
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
export type GetEmployeeDetailInfoByUserIdResponse = Awaited<ReturnType<typeof getEmployeeDetailInfoByUserId>>;
