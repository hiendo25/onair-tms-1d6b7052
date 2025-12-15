import { RESOURCE_OPTIONS } from "@/constants/permission.constant";
import { PermissionActions } from "@/model/permission.model";
import { ACTION_OPTIONS, PermissionModule, RoleFormData } from "@/modules/roles/types";
import { supabase } from "@/services";
import { slugify } from "@/utils/slugify";

export interface AdminGetRoleListParams {
  page?: number;
  pageSize?: number;
}
const DEFAULT_PAGE = 1;
const DEFAULT_LIMIT = 10;

export const getRoleList = async (params?: AdminGetRoleListParams) => {
  return supabase
    .from("roles")
    .select("*")
    .order("created_at", { ascending: false })
    .then(({ data, error }) => {
      if (error) return Promise.reject(error);
      return data || [];
    });
};

export const adminGetRoleList = async (params?: AdminGetRoleListParams) => {
  const { page = DEFAULT_PAGE, pageSize = DEFAULT_LIMIT } = params || {};

  const safePage = Number.isFinite(page) ? Math.floor(page) : DEFAULT_PAGE;
  const safeLimit = Number.isFinite(pageSize) ? Math.floor(pageSize) : DEFAULT_LIMIT;

  const from = (safePage - 1) * pageSize;
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
export type AdminGetRoleListResponse = Awaited<ReturnType<typeof adminGetRoleList>>;
export const getGroupPermissionList = async () => {
  return Object.fromEntries(
    RESOURCE_OPTIONS.map((res) => [
      res.code,
      { id: res.code, name: res.label, actions: Object.values(ACTION_OPTIONS) },
    ]),
  );
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

  const { data: rolePerms, error: rolePermsError } = await supabase
    .from("role_permissions")
    .select(`*`)
    .eq("role_id", role.id);

  if (rolePermsError) return Promise.reject(rolePermsError);

  const selectedPermissions = new Map<string, Set<PermissionActions>>();
  const originalSelectedPermissions = new Map<string, Set<PermissionActions>>();

  RESOURCE_OPTIONS.forEach((res) => {
    selectedPermissions.set(res.code, new Set<PermissionActions>());
    originalSelectedPermissions.set(res.code, new Set<PermissionActions>());
  });

  rolePerms.forEach((perm) => {
    if (selectedPermissions.has(perm.resource_code)) {
      selectedPermissions.get(perm.resource_code)?.add(perm.action_code as PermissionActions);
      originalSelectedPermissions.get(perm.resource_code)?.add(perm.action_code as PermissionActions);
    }
  });

  return {
    id: role.id,
    name: role.title,
    description: role.description || "",
    selectedPermissions,
    originalSelectedPermissions,
    modules: Object.fromEntries(
      RESOURCE_OPTIONS.map((res) => [
        res.code,
        { id: res.code, name: res.label, actions: Object.values(ACTION_OPTIONS) },
      ]),
    ),
  };
}

export interface RoleParams {
  id?: string;
  title: string;
  description?: string;
  organization_id?: string;
}

export interface PermissionParams {
  resource_code: string;
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
    const deletePromises = permissionsToRemove.map(({ resource_code, action_code }) =>
      supabase
        .from("role_permissions")
        .delete()
        .eq("role_id", roleId)
        .eq("resource_code", resource_code)
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
  const code = await generateCode(data.title);

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
