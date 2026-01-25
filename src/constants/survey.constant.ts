import { SurveyQuestionType } from "@/model/survey";
export const QUESTION_TYPE_OPTIONS: { value: SurveyQuestionType; label: string }[] = [
  { value: "text", label: "Văn bản" },
  { value: "radio", label: "Một lựa chọn" },
  { value: "checkbox", label: "Nhiều lựa chọn" },
  { value: "rating", label: "Đánh giá" },
  { value: "yes_no", label: "Có hoặc không" },
  { value: "sort_rating", label: "Đánh giá sắp xếp" },
];

export const getQuestionTypeLabel = (value: SurveyQuestionType) => {
  return QUESTION_TYPE_OPTIONS.find((opt) => opt.value === value)?.label;
};
