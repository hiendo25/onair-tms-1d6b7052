import { supabase } from "@/services";

const getPositions = async () => {
  const response = await supabase.from("positions").select("*");

  return response.data;
};

const getFirstOrganization = async () => {
  const { data: organizations, error: fetchError } = await supabase
    .from("organizations")
    .select("id")
    .limit(1);

  if (fetchError) {
    throw new Error(fetchError.message);
  }

  // If no organization exists, throw an error
  if (!organizations || organizations.length === 0) {
    throw new Error("Please create an organization first.");
  }

  return organizations[0]!.id;
};

const createPosition = async (title: string) => {
  // Get the first organization (throws error if none exists)
  const organizationId = await getFirstOrganization();

  const { data, error } = await supabase
    .from("positions")
    .insert({
      title,
      organization_id: organizationId,
    })
    .select("*")
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return data;
};

export {
  getPositions,
  createPosition,
};

