import { supabase } from "@/services";
import { createSVClient } from "@/services";
import { SupabaseUser } from "@/types/supabase-user.type";

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

const authServerSignOut = async () => {
  const supabase = await createSVClient();
  return await supabase.auth.signOut();
};
const getServerSession = async () => {
  const supabase = await createSVClient();
  return await supabase.auth.getSession();
};
export type GetServerSessionResponse = Awaited<ReturnType<typeof getServerSession>>;

const getCurrentUser = async () => {
  const supabase = await createSVClient();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();
  return user ? (user as SupabaseUser) : null;
};

const ensureGetCurrentUser = async () => {
  const supabase = await createSVClient();
  const { data, error } = await supabase.auth.getUser();
  if (error) {
    throw new Error(error.message);
  }
  return data.user as SupabaseUser;
};

const getClaims = async () => {
  const supabase = await createSVClient();
  return await supabase.auth.getClaims();
};

export {
  authSignOut,
  authSignInWithPassword,
  authSignInWithGoogle,
  getCurrentUser,
  ensureGetCurrentUser,
  authSignUp,
  authServerSignOut,
  getServerSession,
  getClaims,
};
