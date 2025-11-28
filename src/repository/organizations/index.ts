import { createSVClient } from "@/services";
import type { OrganizationDto } from "@/types/dto/organizations";

export async function getFirstOrganization(): Promise<OrganizationDto> {
  const supabase = await createSVClient();

  const { data, error } = await supabase.from("organizations").select("*").limit(1).single();

  if (error) {
    throw new Error(`Failed to fetch organization: ${error.message}`);
  }

  if (!data) {
    throw new Error("No organization found");
  }

  return data as OrganizationDto;
}

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
