import { createClient } from "@/services";
import { createSVClient } from "@/services";

import { CreateUserPreferencePayload, UpdateUserPreferencePayload, UpsertUserPreferencePayload } from "./type";
const getUserPreferencesByUserId = async (userId: string) => {
  const supabaseClient = await createSVClient();

  return await supabaseClient.from("user_references").select("*").eq("user_id", userId).maybeSingle();
};

const createUserPreference = async (payload: CreateUserPreferencePayload) => {
  const supabaseClient = createClient();

  try {
    return await supabaseClient.from("user_references").insert(payload).select("*");
  } catch (err) {
    throw new Error("Fail to get user preferences");
  }
};
const upsertUserPreference = async (payload: UpsertUserPreferencePayload) => {
  const supabaseClient = createClient();

  try {
    return await supabaseClient.from("user_references").upsert(payload).select("*");
  } catch (err) {
    throw new Error("Fail to get user preferences");
  }
};

export { getUserPreferencesByUserId, createUserPreference, upsertUserPreference };
