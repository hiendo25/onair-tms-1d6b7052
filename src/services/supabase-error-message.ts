import { PostgrestError } from "@supabase/supabase-js";

const ERROR_MESSAGES: Record<string, string> = {
  "23505": "Lớp học đã được tạo, tạo lại lớp học mới.",
};
export const getErrorMessage = (err: PostgrestError): string => {
  return ERROR_MESSAGES[err.code] || err.message;
};
