import type { PostgrestError } from "@supabase/supabase-js";
export interface SupabaseResultSuccess<T> {
  data: T;
  error: null;
}

export interface SupabaseResultFailure<E> {
  data: null;
  error: E;
}

export type SupabaseResult<T, E = Error> = SupabaseResultSuccess<T> | SupabaseResultFailure<E>;

export const isOk = <T, E>(r: SupabaseResult<T, E>): r is SupabaseResultSuccess<T> => r.error === null;
export const isErr = <T, E>(r: SupabaseResult<T, E>): r is SupabaseResultFailure<E> => r.error !== null;

export const tryCatchSupabase = async <T>(
  promise: Promise<{ data: T | null; error: PostgrestError | null }>,
): Promise<SupabaseResult<T, PostgrestError>> => {
  try {
    const { data, error } = await promise;

    if (error) {
      return { data: null, error };
    }
    if (!data) {
      return {
        data: null,
        error: {
          code: "",
          details: "",
          message: "No Data return",
          name: "",
          hint: "",
        },
      };
    }
    return { data, error: null };
  } catch (e: any) {
    throw new Error("Error");
  }
};
