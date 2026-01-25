import { createClient } from "@/services";

import { CreateSurveyAnswersPayload, UpdateSurveyAnswers } from "./type";

const createSurveyQuestionOptions = async (payload: CreateSurveyAnswersPayload) => {
  const supabase = createClient();
  try {
    return await supabase.from("surveys_answers").insert(payload).select("*").single();
  } catch (err: any) {
    throw new Error("Unable create survey question options for sv error.");
  }
};

export { createSurveyQuestionOptions };
