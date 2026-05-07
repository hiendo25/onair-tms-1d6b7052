import { StoreApi } from "zustand";

import { authRepository } from "@/repository";

import { AuthStore, AuthStoreActions, AuthStoreState } from "./authStore";
const attachActions =
  (initState: AuthStoreState) =>
  (set: StoreApi<AuthStore>["setState"], get: StoreApi<AuthStore>["getState"]): AuthStoreActions => ({
    reset: () => set({ data: undefined }),
  });
export default attachActions;
