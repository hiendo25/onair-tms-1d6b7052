"use server";
import { createSVClient } from "@/services";

export async function getUserRolesByUserId(userId: string) {
  try {
    const supabaseSv = await createSVClient();
    return await supabaseSv
      .from("user_roles")
      .select(
        `
				role:roles (
					id, title, code,
					role_permissions (
						group_permission (resource_code),
						action_code
					)
				)
  		`,
      )
      .eq("user_id", userId);
  } catch (error) {
    throw new Error("Get permission error.");
  }
}
export type GetUsersRolesByUserIdResponse = Awaited<ReturnType<typeof getUserRolesByUserId>>;
