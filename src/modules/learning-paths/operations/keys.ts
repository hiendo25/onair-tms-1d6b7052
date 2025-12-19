export const LEARNING_PATHS_KEYS = {
  all: ["learning-paths"] as const,
  lists: () => [...LEARNING_PATHS_KEYS.all, "list"] as const,
  list: (params: { page?: number; limit?: number; search?: string }) =>
    [...LEARNING_PATHS_KEYS.lists(), params] as const,
  details: () => [...LEARNING_PATHS_KEYS.all, "detail"] as const,
  detail: (id: string) => [...LEARNING_PATHS_KEYS.details(), id] as const,
};

