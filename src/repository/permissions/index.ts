"use server";
import { createServiceRoleClient, createSVClient } from "@/services";

export async function getUserRolesByUserId(userId: string) {
  try {
    const supabaseSv = await createServiceRoleClient();
    const { data, error } = await supabaseSv
      .from("user_roles")
      .select(
        `
				role:roles (
					id, title, code,
					role_permissions (
						resource_code,
						action_code
					)
				)
  		`,
      )
      .eq("user_id", userId);

    if (error) console.error(error);
    return {
      data,
      error,
    };
  } catch (err) {
    throw new Error("Get user roles failed");
  }
}
export type GetUsersRolesByUserIdResponse = Awaited<ReturnType<typeof getUserRolesByUserId>>;
