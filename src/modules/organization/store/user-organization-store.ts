import { createStore } from "zustand/vanilla";
import { UserOrganization } from "../types";
type UserOrganizationState = {
  data: UserOrganization;
};

type OrganizationStoreApi = UserOrganizationState;

const createOrganizationStore = (initState: UserOrganizationState) => {
  return createStore<OrganizationStoreApi>()((set, get) => ({
    ...initState,
  }));
};
export { createOrganizationStore };
export type { OrganizationStoreApi, UserOrganizationState };
