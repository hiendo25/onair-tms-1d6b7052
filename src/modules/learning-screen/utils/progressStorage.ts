export interface LessonVideoProgress {
  position: number;
  duration?: number;
  updatedAt: string;
}

export interface LessonDocumentProgress {
  page: number;
  totalPages?: number;
  zoom?: number;
  updatedAt: string;
}

export interface StoredLessonProgress {
  lastVisitedAt: string;
  completed?: boolean;
  video?: LessonVideoProgress;
  document?: LessonDocumentProgress;
}

export interface StoredCourseProgress {
  courseId: string;
  studentId: string;
  lastLessonId?: string;
  lessons: Record<string, StoredLessonProgress>;
}

const STORAGE_PREFIX = "learning:progress:v1";

const isBrowser = () => typeof window !== "undefined" && typeof window.localStorage !== "undefined";

const getStorageKey = (studentId: string, courseId: string) =>
  `${STORAGE_PREFIX}:${studentId}:${courseId}`;

const safeParse = <T>(value: string | null): T | null => {
  if (!value) {
    return null;
  }
  try {
    return JSON.parse(value) as T;
  } catch {
    return null;
  }
};

const readState = (studentId: string, courseId: string): StoredCourseProgress | null => {
  if (!isBrowser()) {
    return null;
  }

  const key = getStorageKey(studentId, courseId);
  const rawValue = window.localStorage.getItem(key);
  return safeParse<StoredCourseProgress>(rawValue);
};

const writeState = (state: StoredCourseProgress) => {
  if (!isBrowser()) {
    return;
  }
  const key = getStorageKey(state.studentId, state.courseId);
  try {
    window.localStorage.setItem(key, JSON.stringify(state));
  } catch {
    // Swallow quota errors silently
  }
};

const ensureState = (studentId: string, courseId: string): StoredCourseProgress => {
  const existing = readState(studentId, courseId);
  if (existing) {
    return existing;
  }
  return {
    courseId,
    studentId,
    lessons: {},
  };
};

export const getCourseProgressState = (
  studentId?: string | null,
  courseId?: string | null,
): StoredCourseProgress | null => {
  if (!studentId || !courseId) {
    return null;
  }
  return readState(studentId, courseId);
};

export const getLessonProgressState = (
  studentId: string | null | undefined,
  courseId: string | null | undefined,
  lessonId: string | null | undefined,
): StoredLessonProgress | null => {
  if (!studentId || !courseId || !lessonId) {
    return null;
  }
  const courseState = readState(studentId, courseId);
  if (!courseState) {
    return null;
  }
  return courseState.lessons[lessonId] ?? null;
};

type LessonProgressUpdates = Partial<Omit<StoredLessonProgress, "lastVisitedAt">> & {
  video?: Omit<LessonVideoProgress, "updatedAt">;
  document?: Omit<LessonDocumentProgress, "updatedAt">;
};

export const updateLessonProgressState = (
  studentId: string | null | undefined,
  courseId: string | null | undefined,
  lessonId: string | null | undefined,
  updates: LessonProgressUpdates,
): StoredCourseProgress | null => {
  if (!studentId || !courseId || !lessonId || !isBrowser()) {
    return null;
  }

  const state = ensureState(studentId, courseId);
  const prevLessonState = state.lessons[lessonId] ?? null;

  const nextLessonState: StoredLessonProgress = {
    ...(prevLessonState ?? {
      lastVisitedAt: new Date().toISOString(),
    }),
    lastVisitedAt: new Date().toISOString(),
  };

  if ("completed" in updates && typeof updates.completed === "boolean") {
    nextLessonState.completed = updates.completed;
  }

  if ("video" in updates && updates.video) {
    nextLessonState.video = {
      ...updates.video,
      updatedAt: new Date().toISOString(),
    };
  }

  if ("document" in updates && updates.document) {
    nextLessonState.document = {
      ...updates.document,
      updatedAt: new Date().toISOString(),
    };
  }

  state.lessons[lessonId] = nextLessonState;
  state.lastLessonId = lessonId;
  writeState(state);
  return state;
};

export const markLessonCompleted = (
  studentId: string | null | undefined,
  courseId: string | null | undefined,
  lessonId: string | null | undefined,
  isCompleted: boolean = true,
) => {
  return updateLessonProgressState(studentId, courseId, lessonId, { completed: isCompleted });
};

export const recordLessonVisit = (
  studentId: string | null | undefined,
  courseId: string | null | undefined,
  lessonId: string | null | undefined,
) => {
  return updateLessonProgressState(studentId, courseId, lessonId, {});
};

export const clearLessonProgressState = (
  studentId: string | null | undefined,
  courseId: string | null | undefined,
  lessonId: string | null | undefined,
): StoredCourseProgress | null => {
  if (!studentId || !courseId || !lessonId || !isBrowser()) {
    return null;
  }
  const state = ensureState(studentId, courseId);
  if (state.lessons[lessonId]) {
    delete state.lessons[lessonId];
    if (state.lastLessonId === lessonId) {
      state.lastLessonId = undefined;
    }
    writeState(state);
    return state;
  }
  return state;
};

export const getLastVisitedLessonId = (
  studentId: string | null | undefined,
  courseId: string | null | undefined,
): string | null => {
  const courseState = getCourseProgressState(studentId, courseId);
  return courseState?.lastLessonId ?? null;
};
