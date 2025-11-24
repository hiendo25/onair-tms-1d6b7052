import { supabase } from "@/services";

const authSignOut = async () => {
  return await supabase.auth.signOut();
};

export interface AuthSignInWithPasswordPayload {
  email: string;
  password: string;
}
const authSignInWithPassword = async (payload: AuthSignInWithPasswordPayload) => {
  return await supabase.auth.signInWithPassword(payload);
};

export interface AuthSignInWithGoogleOptions {
  redirectTo?: string;
  scopes?: string;
}
const authSignInWithGoogle = async (options: AuthSignInWithGoogleOptions) => {
  return await supabase.auth.signInWithOAuth({
    provider: "google",
    options,
  });
};

export interface AuthSignUpPayload {
  email: string;
  password: string;
}
const authSignUp = async (payload: AuthSignUpPayload) => {
  return await supabase.auth.signUp({
    ...payload,
    options: {},
  });
};

export { authSignOut, authSignInWithPassword, authSignInWithGoogle, authSignUp };
