import {
  DefaultError,
  QueryClient,
  QueryKey,
  useInfiniteQuery,
  useMutation,
  UseMutationOptions,
  UseMutationResult,
  useQueries,
  useQuery,
  UseQueryOptions,
  UseQueryResult,
} from "@tanstack/react-query";
import { useSnackbar } from "notistack";

import { DomainError } from "./errors/DomainError";

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
  queryClient?: QueryClient,
): UseMutationResult<TData, TError, TVariables, TOnMutateResult> {
  const { enqueueSnackbar } = useSnackbar();

  return useMutation(
    {
      ...options,
      onError: (error, variables, onMutateResult, context) => {
        // Interceptor: Show error notification
        let errorMessage = "";
        if (error instanceof DomainError) {
          errorMessage = error.message;
        }

        enqueueSnackbar(errorMessage, { variant: "error" });
        // Call original onError if provided
        options?.onError?.(error, variables, onMutateResult, context);
      },
    },
    queryClient,
  );
}

function useTQuery<
  TQueryFnData = unknown,
  TError = DefaultError,
  TData = TQueryFnData,
  TQueryKey extends QueryKey = QueryKey,
>(
  options: UseQueryOptions<TQueryFnData, TError, TData, TQueryKey>,
  queryClient?: QueryClient,
): UseQueryResult<NoInfer<TData>, TError> {
  return useQuery(options, queryClient);
}

export { getQueryClient, useTQuery, useTMutation, useQueries as useTQueries, useInfiniteQuery as useTInfiniteQuery };
