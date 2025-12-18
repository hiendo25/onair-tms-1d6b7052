import { useState } from "react";
import { AuthError } from "@supabase/supabase-js";
import { useRouter } from "next/navigation";

import { AuthSignInWithPasswordPayload } from "@/repository/auth";
import { useSignInWithGoogleMutation, useSignInWithPasswordMutation } from "../operations/mutation";
/**
 *
 * SIGN IN WITH PASSWORD
 */

export const useAuthSignInWithPassword = () => {
  const { mutate: signInWithPassword, isPending } = useSignInWithPasswordMutation();
  const [error, setError] = useState<AuthError | null>(null);
  const router = useRouter();
  const onSignInWithPassword = (payload: AuthSignInWithPasswordPayload) => {
    signInWithPassword(payload, {
      onSuccess: ({ data, error }) => {
        if (error) {
          console.error("Error signing in:", error);
          setError(error);
          return;
        }
        setError(null);
        router.push("/dashboard");
      },
      onError: (error) => {
        console.error("Error signing in:", error);
      },
    });
  };
  return { signInWithPassword: onSignInWithPassword, isPending, error };
};

/**
 *
 * SIGN IN WITH GOOGLE
 */
export const useAuthSignInWithGoogle = () => {
  const { mutate: signInWithGoogle, isPending } = useSignInWithGoogleMutation();
  const onSignInWithGoogle = () => {
    signInWithGoogle({
      redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/auth/callback`,
    });
  };
  return { signInWithGoogle: onSignInWithGoogle, isPending };
};
