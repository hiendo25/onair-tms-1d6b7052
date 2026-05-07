import { Database, Tables } from "@/types/supabase.types";

export type Lesson = Tables<"lessons">;
export type LessonType = Database["public"]["Enums"]["lesson_type"];
export type LessonStatus = Tables<"lessons">["status"];
