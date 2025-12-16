import { createClient } from "@/services";

import {
  CreateSurveyQuestionOptionsPayload,
  UpdateSurveyQuestionOptionsPayload,
  UpsertSurveyQuestionOptionsPayload,
} from "./type";

const createSurveyQuestionOptions = async (payload: CreateSurveyQuestionOptionsPayload) => {
  const supabase = createClient();
  try {
    return await supabase.from("surveys_questions_options").insert(payload).select("*").single();
  } catch (err: any) {
    throw new Error("Unable create survey question options for sv error.");
  }
};

const updateSurveyQuestionOptions = async (payload: UpdateSurveyQuestionOptionsPayload) => {
  const supabase = createClient();
  const { id, ...updatePayload } = payload;
  try {
    return await supabase
      .from("surveys_questions_options")
      .update(updatePayload)
      .eq("id", payload.id)
      .select("*")
      .single();
  } catch (err: any) {
    throw new Error("Unable update survey question options for sv error.");
  }
};

const upsertSurveyQuestionOptions = async (upsertPayload: UpsertSurveyQuestionOptionsPayload) => {
  const supabase = createClient();

  try {
    return await supabase.from("surveys_questions_options").upsert(upsertPayload.payload).select("*").single();
  } catch (err: any) {
    throw new Error("Unable update survey question options for sv error.");
  }
};

export { createSurveyQuestionOptions, updateSurveyQuestionOptions, upsertSurveyQuestionOptions };
