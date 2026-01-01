import { createClient } from "@/services";

import {
  AnswerByQuestionType,
  CreateAnswerResponsePayload,
  CreateSurveyResponsePayload,
  SurveyResponseAnswerValueType,
} from "./type";

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

const getSurveyResponseById = async (surveyResponseId: string) => {
  const supabase = createClient();
  try {
    return await supabase
      .from("surveys_response")
      .select(
        `
				id,
				employees(
					id, 
					employee_type, 
					employee_code, 
					profiles(
						id, 
						full_name, 
						avatar
						)
					),
				target_id,
				target_type,
				created_at,
				survey_id,
				survey:surveys(
					id, 
					title
				),
				answers:surveys_answers(
					id, 
					question_id, 
					question_text, 
					question_type, 
					answer_value
				)
			`,
        { count: "exact" },
      )
      .eq("id", surveyResponseId)
      .single()
      .overrideTypes<
        {
          responses: Array<{
            answers: Array<
              Omit<{ id: string; question_id: string; question_text: string }, never> & AnswerByQuestionType
            >;
          }>;
        },
        { merge: true }
      >();
  } catch (err: any) {
    throw new Error(`Unable get response by ${surveyResponseId}`);
  }
};

export type GetSurveyResponseByIdResponse = Awaited<ReturnType<typeof getSurveyResponseById>>;

export { createResponse, bulkCreateAnswerResponse, getSurveyResponseById };
