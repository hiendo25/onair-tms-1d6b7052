import { createClient } from "@/services";

import { CreateAnswerResponsePayload, CreateSurveyResponsePayload, SurveyResponseAnswerValueType } from "./type";

const createResponse = async (payload: CreateSurveyResponsePayload) => {
  const supabase = createClient();
  try {
    return await supabase.from("surveys_response").insert(payload).select("*").single();
  } catch (err: any) {
    throw new Error("Unable create survey question options for sv error.");
  }
};

const bulkCreateAnswerResponse = async (payload: CreateAnswerResponsePayload[]) => {
  const supabase = createClient();
  try {
    return await supabase.from("surveys_answers").insert(payload).select("*");
  } catch (err: any) {
    throw new Error("Unable create survey question options for sv error.");
  }
};

const getResponsesBySurveyId = async (surveyId: string) => {
  const supabase = createClient();
  try {
    return await supabase
      .from("surveys_response")
      .select(
        `
				id,
				employees(id, employee_type, employee_code, profiles(id, full_name, avatar)),
				target_id,
				target_type,
				created_at,
				survey_id,
				answers:surveys_answers(id, question_id, question_text, question_type, answer_value)
			`,
        { count: "exact" },
      )
      .eq("survey_id", surveyId)
      .overrideTypes<Array<{ answers: Array<{ answer_value: SurveyResponseAnswerValueType }> }>, { merge: true }>();
  } catch (err: any) {
    throw new Error(`Unable get response by ${surveyId}`);
  }
};
export type GetResponseBySurveyIdResponse = Awaited<ReturnType<typeof getResponsesBySurveyId>>;

export { createResponse, bulkCreateAnswerResponse, getResponsesBySurveyId };
