import { useTMutation } from "@/lib";
import { authRepository } from "@/repository";
import { AuthSignInWithGoogleOptions, AuthSignInWithPasswordPayload } from "@/repository/auth";
import { client } from "@/services/api";
import { DomainError } from "@/services/DomainError";
import { SignUpDto, SignUpDtoResponse } from "@/types/dto/auth/signup.dto";
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

// export const useSignUpMutation = () => {
//   return useTMutation({
//     mutationFn: authRepository.authSignUp,
//   });
// };

export const useSignUpMutation = () => {
  return useTMutation<SignUpDtoResponse, DomainError, SignUpDto>({
    mutationFn: (dto) => client.post("/auth/signup", dto),
  });
};
