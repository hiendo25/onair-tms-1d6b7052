import {
  DefaultError,
  QueryClient,
  useMutation,
  UseMutationOptions,
  UseMutationResult,
  useQueries,
  useQuery,
} from "@tanstack/react-query";
import { useSnackbar } from "notistack";

const getQueryClient = () => {
  return new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 5 * 60 * 1000,
        retry: 3,
      },
      mutations: {
        // Global mutation defaults
        retry: 1,
      },
    },
  });
};
// declare function useMutation<TData = unknown, TError = DefaultError, TVariables = void, TOnMutateResult = unknown>(options: UseMutationOptions<TData, TError, TVariables, TOnMutateResult>, queryClient?: QueryClient): UseMutationResult<TData, TError, TVariables, TOnMutateResult>;

// Custom mutation hook with interceptor
function useTMutation<TData = unknown, TError = DefaultError, TVariables = void, TOnMutateResult = unknown>(
  options: UseMutationOptions<TData, TError, TVariables, TOnMutateResult>,
): UseMutationResult<TData, TError, TVariables, TOnMutateResult> {
  const { enqueueSnackbar } = useSnackbar();

  return useMutation({
    ...options,
    onError: (error, variables, onMutateResult, context) => {
      // Interceptor: Show error notification
      const errorMessage = error instanceof Error ? error.message : "Có lỗi xảy ra!";
      enqueueSnackbar(errorMessage, { variant: "error" });

      // Call original onError if provided
      options?.onError?.(error, variables, onMutateResult, context);
    },
  });
}

export { getQueryClient, useQuery as useTQuery, useTMutation, useQueries as useTQueries };
