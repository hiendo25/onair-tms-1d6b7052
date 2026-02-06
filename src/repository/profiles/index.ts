import { createSVClient } from "@/services";
import type { Database } from "@/types/supabase.types";

import { ProfileInsert } from "./profile.entity";

export async function createProfile(profileInsert: ProfileInsert) {
  const supabase = await createSVClient();

  const { data: profile, error } = await supabase
    .from("profiles")
    .insert({
      employee_id: profileInsert.employee_id,
      email: profileInsert.email,
      full_name: profileInsert.full_name,
      phone_number: profileInsert.phone_number,
      gender: profileInsert.gender,
      birthday: profileInsert.birthday,
    })
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to create profile: ${error.message}`);
  }

  return profile;
}

export async function updateProfileByEmployeeId(
  employeeId: string,
  data: {
    full_name?: string;
    email?: string;
    phone_number?: string;
    gender?: Database["public"]["Enums"]["gender"];
    birthday?: string | null;
  },
) {
  const supabase = await createSVClient();

  const { error } = await supabase.from("profiles").update(data).eq("employee_id", employeeId);

  if (error) {
    throw new Error(`Failed to update profile: ${error.message}`);
  }
}

export async function deleteProfileByEmployeeId(employeeId: string) {
  const supabase = await createSVClient();

  const { error } = await supabase.from("profiles").delete().eq("employee_id", employeeId);

  if (error) {
    throw new Error(`Failed to delete profile: ${error.message}`);
  }
}

export async function findProfilesByEmails(emails: string[]) {
  const supabase = await createSVClient();

  const { data, error } = await supabase.from("profiles").select("email").in("email", emails);

  if (error) {
    throw new Error(`Failed to check emails: ${error.message}`);
  }

  return data || [];
}
