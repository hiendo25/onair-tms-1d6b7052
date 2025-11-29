import { Permission, Resources } from "@/constants/permission.constant";
import { employeesRepository, organizationsRepository, permissionRepository } from "@/repository";
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
    const { data: userRoles, error } = await permissionRepository.getUserRolesByUserId(this.userId);

    const permissions: Permission[] = [];

    if (userRoles) {
      userRoles.forEach((ur) => {
        ur.role.role_permissions.forEach((rolePer) => {
          const resource = rolePer.group_permission.resource_code as Resources;
          const resourceAction = `${resource}:${rolePer.action_code}` as Permission;
          permissions.push(resourceAction);
        });
      });
    }

    return permissions;
  }

  private buildResourceAction(resource: Resources, action: any) {}
}
