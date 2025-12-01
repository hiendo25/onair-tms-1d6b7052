import { ACTION_OPTIONS, PermissionModule, RoleFormData } from "@/modules/roles/types";
import { PermissionActions } from "@/model/permission.model";
import { supabase } from "@/services";
import { slugify } from "@/utils/slugify";

export interface GetRoleListParams {
  page?: number;
  pageSize?: number;
}

export const getRoleList = async (params?: GetRoleListParams) => {
  const { page = 0, pageSize = 10 } = params || {};
  const from = page * pageSize;
  const to = from + pageSize - 1;

  const { count } = await supabase.from("roles").select("*", { count: "exact", head: true });

  return supabase
    .from("roles")
    .select("*, user_roles(user_id)")
    .order("created_at", { ascending: false })
    .range(from, to)
    .then(({ data, error }) => {
      if (error) return Promise.reject(error);

      return {
        items: data.map((role) => ({
          ...role,
          user_count: role.user_roles?.length || 0,
          user_roles: undefined,
        })),
        itemCount: count || 0,
      };
    });
};

export const getGroupPermissionList = async () => {
  return supabase
    .from("group_permission")
    .select("id, title")
    .then(({ data, error }) => {
      if (error) return Promise.reject(error);

      return Object.fromEntries(
        data.map((gp) => [gp.id, { id: gp.id, name: gp.title || "", actions: Object.values(ACTION_OPTIONS) }]),
      );
    });
};

export async function getRolePermissions(roleCode: string): Promise<RoleFormData> {
  const { data: role, error: roleError } = await supabase
    .from("roles")
    .select("id, title, code, description")
    .eq("code", roleCode)
    .limit(1)
    .maybeSingle();

  if (roleError) return Promise.reject(roleError);
  if (!role) return Promise.reject("Role not found");

  const { data: groupPerms, error: groupPermsError } = await supabase
    .from("group_permission")
    .select(
      `
    id,
    title,
    resource_code,
    role_permissions!left(
      action_code
    )
  `,
    )
    .eq("role_permissions.role_id", role.id)
    .order("title");

  if (groupPermsError) return Promise.reject(groupPermsError);
  if (!groupPerms) return Promise.reject("No group permissions found");

  const selectedPermissions = new Map<string, Set<PermissionActions>>();

  const grouped = groupPerms.reduce((acc, gp) => {
    (gp.role_permissions || []).forEach((rp) => {
      const exist = selectedPermissions.get(gp.id);
      if (exist) {
        exist.add(rp.action_code as PermissionActions);
      } else {
        selectedPermissions.set(gp.id, new Set([rp.action_code as PermissionActions]));
      }
    });

    acc[gp.id] = {
      id: gp.id,
      name: gp.title || "",
      actions: ACTION_OPTIONS,
    };
    return acc;
  }, {} as Record<string, PermissionModule>);

  return {
    id: role.id,
    name: role.title || "",
    description: role.description || "",
    originalSelectedPermissions: selectedPermissions,
    selectedPermissions,
    modules: grouped,
  };
}

export interface RoleParams {
  id?: string;
  title: string;
  description?: string;
  organization_id?: string;
}

export interface PermissionParams {
  group_permission_id: string;
  action_code: PermissionActions;
}
export interface RolePermissionsParams {
  roleId?: string;
  permissionsToAdd: PermissionParams[];
  permissionsToRemove: PermissionParams[];
}

export const updateRolePermissions = async (params: RolePermissionsParams) => {
  const { roleId, permissionsToAdd, permissionsToRemove } = params;

  if (!roleId) return Promise.reject("Role ID is required");

  if (permissionsToRemove.length > 0) {
    const deletePromises = permissionsToRemove.map(({ group_permission_id, action_code }) =>
      supabase
        .from("role_permissions")
        .delete()
        .eq("role_id", roleId)
        .eq("group_permission_id", group_permission_id)
        .eq("action_code", action_code),
    );
    await Promise.all(deletePromises);
  }

  if (permissionsToAdd.length > 0) {
    const permissionsToInsert = permissionsToAdd.map((p) => ({
      role_id: roleId,
      ...p,
    }));
    const { error } = await supabase.from("role_permissions").insert(permissionsToInsert);
    if (error) return Promise.reject(error);
  }
  return { success: true };
};

const generateCode = async (title: string) => {
  let code = slugify(title);
  let count = 1;

  while (true) {
    const { data: existingRole } = await supabase.from("roles").select("id").eq("code", code).limit(1).maybeSingle();
    if (!existingRole) break;
    code = `${slugify(title)}-${count}`;
    count++;
  }
  return code;
};

export const createRole = async (data: RoleParams & { permissions: PermissionParams[] }) => {
  let code = await generateCode(data.title);

  if (!code) return Promise.reject("Failed to generate role code");
  if (!data.organization_id) return Promise.reject("Organization ID is required");

  const { data: role, error: roleError } = await supabase
    .from("roles")
    .insert({
      title: data.title,
      code: code,
      description: data.description,
      organization_id: data.organization_id,
    })
    .select()
    .single();

  if (roleError) return Promise.reject(roleError);
  if (data.permissions.length > 0) {
    const permissionsToInsert = data.permissions.map((p) => ({
      role_id: role.id,
      ...p,
    }));
    const { error: permsError } = await supabase.from("role_permissions").insert(permissionsToInsert);
    if (permsError) return Promise.reject(permsError);
  }
  return role;
};

export const updateRole = async (roleId: string, data: RoleParams & RolePermissionsParams) => {
  const { data: existingRole, error: existingRoleError } = await supabase
    .from("roles")
    .select("id, title, description")
    .eq("id", roleId)
    .limit(1)
    .maybeSingle();

  if (existingRoleError) return Promise.reject(existingRoleError);
  if (!existingRole) return Promise.reject("Role not found");

  const { title, description, permissionsToAdd, permissionsToRemove } = data;

  const { error: roleError } = await supabase.from("roles").update({ title, description }).eq("id", roleId);

  if (roleError) return Promise.reject(roleError);

  await updateRolePermissions({ roleId, permissionsToAdd, permissionsToRemove });
  return { success: true };
};

export const deleteRole = async (roleId: string) => {
  const { error } = await supabase.from("roles").delete().eq("id", roleId);
  if (error) return Promise.reject(error);
  return { success: true };
};
