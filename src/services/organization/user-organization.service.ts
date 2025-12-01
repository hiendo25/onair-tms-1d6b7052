import { buildPermission, Permissions, Resources } from "@/constants/permission.constant";
import { employeesRepository, permissionRepository } from "@/repository";
export class UserOrganizationService {
  private userId;

  constructor(userId: string) {
    this.userId = userId;
  }

  async getEmployeeDetail() {
    const employee = await employeesRepository.getEmployeeDetailByUserId(this.userId);

    return employee;
  }

  async getPermissions() {
    const { data: userRoles } = await permissionRepository.getUserRolesByUserId(this.userId);

    return userRoles
      ? userRoles.reduce<Permissions[]>((sumPers, ur) => {
          const pers = ur.role.role_permissions.reduce<Permissions[]>((subPers, rolePer) => {
            const resource = rolePer.resource_code as Resources;
            const perAction = buildPermission(resource, rolePer.action_code);
            return [...subPers, perAction];
          }, []);
          return [...sumPers, ...pers];
        }, [])
      : [];
  }

  async getRolesPermissions() {
    const { data: userRoles } = await permissionRepository.getUserRolesByUserId(this.userId);
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
  }
}
