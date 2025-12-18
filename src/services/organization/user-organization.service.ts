import { buildPermission, Permissions, Resources } from "@/constants/permission.constant";
import {
  employeesRepository,
  organizationsRepository,
  permissionRepository,
  userPreferenceRepository,
} from "@/repository";
import { GetEmployeesByUserIdResponse } from "@/repository/employees";
export class UserOrganizationService {
  private userId;

  constructor(userId: string) {
    this.userId = userId;
  }

  async getOrganizations() {
    const organizations = await organizationsRepository.getOrganizationsByUserId(this.userId);
    return organizations;
  }

  async getEmployeeByOrganizationId(organizationId: string) {
    const { data: employee, error } = await employeesRepository.getOneEmployeeByUserIdWithOrganizationId({
      userId: this.userId,
      organizationId: organizationId,
    });

    if (!employee) {
      throw new Error("Main employee undefined");
    }
    return employee;
  }

  async getEmployees() {
    const employees = await employeesRepository.getEmployeesByUserId(this.userId);

    return employees;
  }

  async getCurrentEmployee() {
    const userPreference = await userPreferenceRepository.getUserPreferencesByUserId(this.userId);
    const { data: employee, error } = await employeesRepository.getOneEmployeeByUserIdWithOrganizationId({
      userId: this.userId,
      organizationId: userPreference.default_organization_id,
    });

    console.log({ userPreference, employee });
    if (!employee) {
      throw new Error("Main employee undefined");
    }

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
