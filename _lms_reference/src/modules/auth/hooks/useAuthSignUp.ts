import { useSignUpMutation } from "../operations/mutation";

const useAuthSignUp = () => {
  const { mutate: signUp, isPending } = useSignUpMutation();
  const onSignUp = () => {};
  return { signUp: onSignUp, isPending };
};
export default useAuthSignUp;
