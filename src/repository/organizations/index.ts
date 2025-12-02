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
