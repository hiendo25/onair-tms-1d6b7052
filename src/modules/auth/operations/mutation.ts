import { useTMutation } from "@/lib";
import { authRepository } from "@/repository";
import { AuthSignInWithGoogleOptions, AuthSignInWithPasswordPayload } from "@/repository/auth";
export const useSignOutMutation = () => {
  return useTMutation({
    mutationFn: () => authRepository.authSignOut(),
  });
};

export const useSignInWithPasswordMutation = () => {
  return useTMutation({
    mutationFn: authRepository.authSignInWithPassword,
  });
};

export const useSignInWithGoogleMutation = () => {
  return useTMutation({
    mutationFn: (options: AuthSignInWithGoogleOptions) => authRepository.authSignInWithGoogle(options),
  });
};

export const useSignUpMutation = () => {
  return useTMutation({
    mutationFn: authRepository.authSignUp,
  });
};
