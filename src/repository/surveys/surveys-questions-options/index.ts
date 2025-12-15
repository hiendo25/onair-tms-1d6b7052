import { createClient } from "@/services";

import {
  CreateSurveyQuestionOptionPayload,
  UpdateSurveyQuestionOptionPayload,
  UpsertSurveyQuestionOptionPayload,
} from "./type";

const createSurveyQuestionOption = async (payload: CreateSurveyQuestionOptionPayload) => {
  const supabase = createClient();
  try {
    return await supabase.from("surveys_questions_options").insert(payload).select("*").single();
  } catch (err: any) {
    throw new Error("Unable create survey question options for sv error.");
  }
};

const bulkCreateSurveyQuestionOption = async (payload: CreateSurveyQuestionOptionPayload[]) => {
  const supabase = createClient();
  try {
    return await supabase.from("surveys_questions_options").insert(payload).select("*");
  } catch (err: any) {
    throw new Error("Unable create survey question options for sv error.");
  }
};

const updateSurveyQuestionOption = async (payload: UpdateSurveyQuestionOptionPayload) => {
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

const upsertSurveyQuestionOption = async (upsertPayload: UpsertSurveyQuestionOptionPayload) => {
  const supabase = createClient();

  try {
    return await supabase.from("surveys_questions_options").upsert(upsertPayload.payload).select("*").single();
  } catch (err: any) {
    throw new Error("Unable update survey question options for sv error.");
  }
};

export {
  createSurveyQuestionOption,
  updateSurveyQuestionOption,
  upsertSurveyQuestionOption,
  bulkCreateSurveyQuestionOption,
};
