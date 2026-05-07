import { createStore } from "zustand/vanilla";

import { AuthData } from "../types";

import attachActions from "./authActions";
type AuthStoreState = {
  data: AuthData;
};

type AuthStoreActions = {
  reset: () => void;
};

type AuthStore = AuthStoreState & AuthStoreActions;

const createAuthStore = (initState: AuthStoreState) => {
  return createStore<AuthStore>()((set, get) => ({
    ...initState,
    ...attachActions(initState)(set, get),
  }));
};
export { createAuthStore };
export type { AuthStore, AuthStoreActions, AuthStoreState };
