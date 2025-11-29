"use server";
import { createServiceRoleClient } from "@/services";
import { createSVClient } from "@/services";
const serviceRoleClient = createServiceRoleClient();

export interface UserPermissions {
  roles: string[];
  permissions: Set<string>;
}

export async function getUserPermissions(userId: string): Promise<UserPermissions> {
  const { data: userRoles, error: userRolesError } = await serviceRoleClient
    .from("user_roles")
    .select("role:roles (id, title, code)")
    .eq("user_id", userId);

  if (userRolesError || userRoles.length === 0) return { roles: [], permissions: new Set<string>() };

  const { data: permissions, error: permissionsError } = await serviceRoleClient
    .from("user_roles")
    .select(
      `
    role:roles (
      role_permissions (
        group_permission (resource_code),
        action_code
      )
    )
  `,
    )
    .eq("user_id", userId);

  if (permissionsError) {
    return Promise.reject(permissionsError);
  }

  const permissionsSet = new Set<string>();

  permissions.forEach((userRole) => {
    userRole.role.role_permissions.forEach((rolePermission) => {
      const resourceCode = rolePermission.group_permission.resource_code;
      const actionCode = rolePermission.action_code;
      permissionsSet.add(`${resourceCode}:${actionCode}`);
    });
  });

  return {
    roles: userRoles.map((ur) => ur.role.code),
    permissions: permissionsSet,
  };
}

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
