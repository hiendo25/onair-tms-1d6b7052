import { createStore } from "zustand/vanilla";

import { Employee, EmployeeOrganization } from "../types";
type UserOrganizationState = {
  currentOrganization: EmployeeOrganization;
  organizations: EmployeeOrganization[];
  employees: Employee[];
  currentEmployee: Employee;
};

type UserOrganizationActions = {
  setCurrentOrganization: (organizationId: string) => void;
  reset: () => void;
};

type OrganizationStoreApi = UserOrganizationState & UserOrganizationActions;

const createOrganizationStore = (initState: UserOrganizationState) => {
  return createStore<OrganizationStoreApi>()((set, get) => ({
    ...initState,
    setCurrentOrganization: (organizationId) => {
      const { organizations, employees } = get();
      const updateOrganization = organizations.find((org) => org.orgId === organizationId);
      const updateEmployee = employees.find((employee) => employee.organization.id === organizationId);
      if (!updateOrganization || !updateEmployee) return;
      set({ currentOrganization: updateOrganization, currentEmployee: updateEmployee });
    },
    reset: () => {
      set(initState);
    },
  }));
};
export { createOrganizationStore };
export type { OrganizationStoreApi, UserOrganizationState };
