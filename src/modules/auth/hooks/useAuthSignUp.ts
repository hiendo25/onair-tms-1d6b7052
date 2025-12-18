import { AuthSignUpPayload } from "@/repository/auth";
import { useSignUpMutation } from "../operations/mutation";

const useAuthSignUp = () => {
  const { mutate: signUp, isPending } = useSignUpMutation();
  const onSignUp = (payload: AuthSignUpPayload) => {
    signUp(payload, {
      onSuccess: () => {},
    });
  };
  return { signUp: onSignUp, isPending };
};
export default useAuthSignUp;
