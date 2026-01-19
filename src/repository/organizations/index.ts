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

export async function getOrganizationById(id: string): Promise<OrganizationDto> {
  const supabase = await createSVClient();

  const { data, error } = await supabase.from("organizations").select("*").eq("id", id).single();

  if (error) {
    throw new Error(`Failed to fetch organization: ${error.message}`);
  }

  if (!data) {
    throw new Error(`Organization with id ${id} not found`);
  }

  return data as OrganizationDto;
}

const getOrganizationsByUserId = async (userId: string) => {
  const supabase = await createSVClient();

  try {
    const { data, error } = await supabase
      .from("employees")
      .select(
        `
				employee_id:id,
				user_id,
				organization_id,
				organization:organizations!inner(id, name, logo, favicon, shortname, subdomain)
			`,
      )
      .eq("user_id", userId);

    if (!data || error) {
      throw new Error(error?.message || "Organizations is empty");
    }
    return data;
  } catch (err) {
    throw new Error("Fail to get organizations");
  }
};
export type GetOrganizationsByUserIdResponse = Awaited<ReturnType<typeof getOrganizationsByUserId>>;
const getOrganizationByUserIdAndOrganizationId = async (userId: string, organizationId: string) => {
  const supabase = await createSVClient();
  try {
    return await supabase
      .from("employees")
      .select(
        `
				employee_id:id,
				user_id,
				organization_id,
				organization:organizations!inner(id, name, logo, favicon, shortname, subdomain)
			`,
      )
      .eq("user_id", userId)
      .eq("organization_id", organizationId);
  } catch (err) {
    throw new Error("Fail to get organizations");
  }
};
export { getOrganizationsByUserId, getOrganizationByUserIdAndOrganizationId };
