export const COURSE_META_KEY = {
  benefits: "benefits",
  faqs: "faqs",
} as const;

export type CourseMetaKey = keyof typeof COURSE_META_KEY;

export type CourseMetaValue<K extends CourseMetaKey = CourseMetaKey> = K extends "faqs"
  ? { answer: string; question: string }[]
  : K extends "benefits"
  ? string[]
  : any;
