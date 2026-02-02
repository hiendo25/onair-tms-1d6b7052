import { createClient } from "@/services";
import { createSVClient } from "@/services";

import { CreateUserPreferencePayload, UpsertUserPreferencePayload } from "./type";
const getUserPreferencesByUserId = async (userId: string) => {
  const supabaseClient = await createSVClient();

  const { data, error } = await supabaseClient.from("user_references").select("*").eq("user_id", userId).maybeSingle();
  if (error) {
    throw new Error(error?.details || error?.message);
  }
  return data;
};

const createUserPreference = async (payload: CreateUserPreferencePayload) => {
  const supabaseClient = await createSVClient();

  const { data, error } = await supabaseClient.from("user_references").insert(payload).select("*").single();

  if (error) {
    throw new Error(error.details || error.message);
  }
  return data;
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
