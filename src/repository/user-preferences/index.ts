import { UserPreferences } from "@/model/user-preferences";
import { createClient } from "@/services";
import { createSVClient } from "@/services";

const getUserPreferencesByUserId = async (userId: string) => {
  const supabaseClient = await createSVClient();

  try {
    const { data, error } = await supabaseClient
      .from("user_references")
      .select("*")
      .eq("user_id", userId)
      .maybeSingle();
    if (!data || error) {
      throw new Error("User has no preference");
    }
    return data;
  } catch (err) {
    throw new Error("Fail to get user preferences");
  }
};

type CreateUserPreferencePayload = Pick<UserPreferences, "user_id" | "default_organization_id">;
const createUserPreference = async (payload: CreateUserPreferencePayload) => {
  const supabaseClient = createClient();

  try {
    return await supabaseClient.from("user_references").insert(payload).select("*");
  } catch (err) {
    throw new Error("Fail to get user preferences");
  }
};
export { getUserPreferencesByUserId, createUserPreference };
