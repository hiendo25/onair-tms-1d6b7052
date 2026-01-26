import type { Database } from "@/types/supabase.types";

export type QuestionType = Database["public"]["Enums"]["question_type"];
export type QuestionDifficulty = Database["public"]["Enums"]["question_difficulty"];

export const QUESTION_TYPE_LABELS: Record<QuestionType, string> = {
  file: "Tệp tin",
  text: "Tự luận",
  checkbox: "Trắc nghiệm (nhiều câu trả lời đúng)",
  radio: "Trắc nghiệm (1 câu trả lời đúng)",
  matching: "Ghép đôi",
  true_false: "Đúng/Sai",
  order: "Sắp xếp thứ tự",
  drag_and_drop: "Kéo thả",
  fill: "Điền vào chỗ trống",
};

export const QUESTION_DIFFICULTY_LABELS: Record<QuestionDifficulty, string> = {
  easy: "Dễ",
  medium: "Trung bình",
  hard: "Khó",
};

export const QUESTION_TYPE_FILTERS: QuestionType[] = [
  "checkbox",
  "radio",
  "true_false",
  "text",
  "file",
  "order",
  "matching",
];
