import { buildPermission, Permissions, Resources } from "@/constants/permission.constant";
import { employeesRepository, permissionRepository } from "@/repository";
import { GetEmployeesByUserIdResponse } from "@/repository/employees";
export class UserOrganizationService {
  private userId;

  private employees: GetEmployeesByUserIdResponse | null = null;

  constructor(userId: string) {
    this.userId = userId;
    this.ensureUserHasEmployeeMain();
  }

  async getEmployees() {
    const employees = await employeesRepository.getEmployeesByUserId(this.userId);
    this.employees = employees;
    return employees;
  }

  async getMainEmployee() {
    await this.ensureEmployeesInitialized();

    const mainEmployee = this.employees?.find((epl) => epl.is_main);

    if (!mainEmployee) {
      throw new Error("Main employee undefined");
    }

    return mainEmployee;
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

  async updateMainEmployeeOrganization(variables: { employeeId: string; nextOrganizationId: string }) {
    const { nextOrganizationId, employeeId } = variables;
    const { data: nextEmployeeData, error: nextEmployeeError } =
      await employeesRepository.getOneEmployeeByUserIdWithOrganizationId({
        userId: this.userId,
        organizationId: nextOrganizationId,
      });

    if (!nextEmployeeData || nextEmployeeError) {
      throw new Error(nextEmployeeError?.message);
    }
    await employeesRepository.updateMainEmployee({
      employeeId: employeeId,
      isMain: false,
    });
    return await employeesRepository.updateMainEmployee({
      employeeId: nextEmployeeData.id,
      isMain: true,
    });
  }

  private async ensureEmployeesInitialized() {
    if (this.employees !== null) return;

    const employees = await employeesRepository.getEmployeesByUserId(this.userId);

    this.employees = employees;
  }
  private async ensureUserHasEmployeeMain() {
    await this.ensureEmployeesInitialized();

    const employeesOfUser = this.employees;
    const mainEmployee = employeesOfUser?.find((epl) => epl.is_main);

    const firstEmployee = employeesOfUser?.at(0);

    if (mainEmployee || !firstEmployee) return;

    await employeesRepository.updateMainEmployee({
      employeeId: firstEmployee.id,
      isMain: true,
    });
  }
}
