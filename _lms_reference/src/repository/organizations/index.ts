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

export async function getOrganizationById(id: string) {
  const supabase = await createSVClient();

  const { data, error } = await supabase.from("organizations").select("*").eq("id", id).single();

  if (error) {
    console.error(error);
    throw new Error(error.details || error.message);
  }

  return data;
}

export async function getOrganizationsByUserId(userId: string) {
  const supabase = await createSVClient();
  const { data, error } = await supabase
    .from("employees")
    .select(
      `
				employee_id:id,
				user_id,
				organization_id,
				organization:organizations!inner(id, name, logo, favicon, shortname, subdomain, code, is_active)
			`,
    )
    .eq("user_id", userId);

  if (error) {
    throw new Error(error?.details || error?.message);
  }
  return data;
}
export type GetOrganizationsByUserIdResponse = Awaited<ReturnType<typeof getOrganizationsByUserId>>;

export async function getOrganizationByUserIdAndOrganizationId(userId: string, organizationId: string) {
  const supabase = await createSVClient();

  const { data, error } = await supabase
    .from("employees")
    .select(
      `
				employee_id:id,
				user_id,
				organization_id,
				organization:organizations!inner(id, name)
			`,
    )
    .eq("user_id", userId)
    .eq("organization_id", organizationId)
    .maybeSingle();

  if (error) {
    throw new Error(error.details || error.message);
  }
  return data;
}

export async function getOrganizationNameById(organizationId: string) {
  const supabase = await createSVClient();
  const { data, error } = await supabase
    .from("organizations")
    .select("id, name")
    .eq("id", organizationId)
    .maybeSingle();

  if (error) {
    console.error(error);
    throw new Error(error.details || error.message);
  }

  return data;
}

export async function getOrganizationsActiveByUserId(userId: string) {
  const supabase = await createSVClient();
  const { data, error } = await supabase
    .from("employees")
    .select(
      `
				employee_id:id,
				user_id,
				organization_id,
				organization:organizations!inner(id, name, logo, favicon, shortname, subdomain, code, is_active)
			`,
    )
    .eq("user_id", userId)
    .eq("organizations.is_active", true)
    .overrideTypes<Array<{ organization: { is_active: true } }>>();

  if (error) {
    throw new Error(error?.details || error?.message);
  }
  return data;
}
