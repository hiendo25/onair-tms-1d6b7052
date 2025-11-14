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

export type LessonProgressMap = Record<string, StoredLessonProgress>;
