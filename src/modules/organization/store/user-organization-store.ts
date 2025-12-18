import { createStore } from "zustand/vanilla";

import { LOCAL_STORAGE_KEYS } from "@/constants/localStorage.constant";
import { Employee, EmployeeOrganization, UserOrganization } from "../types";
type UserOrganizationState = {
  data: UserOrganization;
  currentOrganization: EmployeeOrganization;
  organizations: EmployeeOrganization[];
  employees: Employee[];
  currentEmployee: Employee;
};

type UserOrganizationActions = {
  setCurrentOrganization: (organizationId: string) => void;
  setEmployeeProfile: (data: UserOrganization) => void;
};

type OrganizationStoreApi = UserOrganizationState & UserOrganizationActions;

const createOrganizationStore = (initState: UserOrganizationState) => {
  return createStore<OrganizationStoreApi>()((set, get) => ({
    ...initState,
    setCurrentOrganization: (organizationId) => {
      const { organizations, employees } = get();
      const orgItem = organizations.find((org) => org.orgId === organizationId);
      const employeeItem = employees.find((employee) => employee.organization.id === organizationId);
      if (!orgItem || !employeeItem) return;
      localStorage.setItem(LOCAL_STORAGE_KEYS.ORGANIZATION_ID, organizationId);
      set({ currentOrganization: orgItem, currentEmployee: employeeItem });
    },
    setEmployeeProfile: (data) => {
      set({ data });
    },
  }));
};
export { createOrganizationStore };
export type { OrganizationStoreApi, UserOrganizationState };
