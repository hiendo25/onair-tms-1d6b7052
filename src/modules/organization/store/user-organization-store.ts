import { createStore } from "zustand/vanilla";

import { EmployeeOrganization, UserOrganization } from "../types";
type UserOrganizationState = {
  data: UserOrganization;
  mainOrganization: EmployeeOrganization;
  employeesOrganizations: EmployeeOrganization[];
};

type UserOrganizationActions = {
  setMainOrganization: (mainOrganization: EmployeeOrganization) => void;
};

type OrganizationStoreApi = UserOrganizationState & UserOrganizationActions;

const createOrganizationStore = (initState: UserOrganizationState) => {
  return createStore<OrganizationStoreApi>()((set, get) => ({
    ...initState,
    setMainOrganization: (mainOrganization) => {
      set({ mainOrganization: mainOrganization });
    },
  }));
};
export { createOrganizationStore };
export type { OrganizationStoreApi, UserOrganizationState };
