export const LEARNING_PATHS_KEYS = {
  all: ["learning-paths"] as const,
  lists: () => [...LEARNING_PATHS_KEYS.all, "list"] as const,
  list: (params: { page?: number; limit?: number; search?: string }) =>
    [...LEARNING_PATHS_KEYS.lists(), params] as const,
  details: () => [...LEARNING_PATHS_KEYS.all, "detail"] as const,
  detail: (id: string) => [...LEARNING_PATHS_KEYS.details(), id] as const,
  current: () => [...LEARNING_PATHS_KEYS.all, "current"] as const,
  progress: (id: string) => [...LEARNING_PATHS_KEYS.all, "progress", id] as const,
  phasesProgress: (id: string) => [...LEARNING_PATHS_KEYS.all, "phases-progress", id] as const,
  phaseProgress: (id: string) => [...LEARNING_PATHS_KEYS.all, "phase-progress", id] as const,
  phaseDetail: (id: string) => [...LEARNING_PATHS_KEYS.all, "phase-detail", id] as const,
  classRoomsProgress: (params: { ids: string[]; learningPathId?: string | null }) =>
    [...LEARNING_PATHS_KEYS.all, "class-rooms-progress", params] as const,
};
