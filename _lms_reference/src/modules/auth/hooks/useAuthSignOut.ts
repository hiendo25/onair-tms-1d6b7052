import { useRouter } from "next/navigation";

import { useSignOutMutation } from "../operations/mutation";
import { useAuthStore } from "../store/AuthProvider";

const useAuthSignOut = () => {
  const resetAuth = useAuthStore((state) => state.reset);
  const { mutate: authSignOut, isPending } = useSignOutMutation();

  const router = useRouter();

  const signOut = () => {
    authSignOut(undefined, {
      onSuccess: () => {
        router.refresh();
        resetAuth();
      },
    });
  };
  return { signOut, isPending };
};
export default useAuthSignOut;
