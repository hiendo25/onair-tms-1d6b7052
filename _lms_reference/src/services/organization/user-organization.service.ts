import { cache } from "react";

import { buildPermission, Permissions, Resources } from "@/constants/permission.constant";
import { employeesRepository, organizationsRepository, permissionRepository } from "@/repository";

export const getOrganizations = cache(async (userId: string) => {
  return await organizationsRepository.getOrganizationsByUserId(userId);
});

export const getEmployeesByUserId = cache(async (userId: string) => {
  return await employeesRepository.getEmployeesByUserId(userId);
});

export const getCurrentEmployee = cache(async (userId: string, organizationId: string) => {
  return await employeesRepository.getOneEmployee({
    userId,
    organizationId,
  });
});

export const getRolesPermissions = cache(async (userId: string) => {
  const { data: userRoles } = await permissionRepository.getUserRolesByUserId(userId);
  const pers = userRoles?.reduce<Permissions[]>((sumPers, ur) => {
    const pers = ur.role.role_permissions.reduce<Permissions[]>((subPers, rolePer) => {
      const resource = rolePer.resource_code as Resources;
      const perAction = buildPermission(resource, rolePer.action_code);
      return [...subPers, perAction];
    }, []);
    return [...sumPers, ...pers];
  }, []);

  return {
    permissions: pers || [],
    roles: userRoles?.map((urRole) => urRole.role.code) || [],
  };
});
