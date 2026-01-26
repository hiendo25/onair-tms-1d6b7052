import * as zod from "zod";

import { questionSchema } from "@/modules/assignment-management/components/assignment-form.schema";
import { Constants } from "@/types/supabase.types";

const difficultyValues = Constants.public.Enums.question_difficulty;

const questionBankFormSchema = zod.object({
  questions: zod.array(questionSchema).min(1, { message: "Câu hỏi không được bỏ trống." }).max(1),
  questionCategories: zod.array(zod.string()).min(1, { message: "Vui lòng chọn ít nhất 1 lĩnh vực." }),
  difficulty: zod.enum(difficultyValues, { message: "Vui lòng chọn độ khó." }),
});

type QuestionBankFormValues = zod.infer<typeof questionBankFormSchema>;

export { questionBankFormSchema, type QuestionBankFormValues };
