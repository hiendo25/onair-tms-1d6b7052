import { createClient } from "@/services";

import {
  BulkUpsertSurveyQuestionPayload,
  CreateSurveyQuestionPayload,
  UpdateSurveyQuestionPayload,
  UpsertSurveyQuestionPayload,
} from "./type";

const createSurveyQuestion = async (payload: CreateSurveyQuestionPayload) => {
  const supabase = createClient();
  try {
    return await supabase.from("surveys_questions").insert(payload).select("*").single();
  } catch (err: any) {
    throw new Error("Unable create survey question options for sv error.");
  }
};

const bulkCreateSurveyQuestion = async (payload: CreateSurveyQuestionPayload[]) => {
  const supabase = createClient();
  try {
    return await supabase.from("surveys_questions").insert(payload).select("*");
  } catch (err: any) {
    throw new Error("Unable create survey question options for sv error.");
  }
};

const updateSurveyQuestion = async (payload: UpdateSurveyQuestionPayload) => {
  const supabase = createClient();
  const { id, ...updatePayload } = payload;
  try {
    return await supabase.from("surveys_questions").update(updatePayload).eq("id", payload.id).select("*").single();
  } catch (err: any) {
    throw new Error("Unable update survey question options for sv error.");
  }
};

const upsertSurveyQuestion = async (upsertPayload: UpsertSurveyQuestionPayload) => {
  const supabase = createClient();

  try {
    return await supabase.from("surveys_questions").upsert(upsertPayload.payload).select("*").single();
  } catch (err: any) {
    throw new Error("Unable update survey question options for sv error.");
  }
};

const bulkUpsertSurveyQuestion = async (bulkUpsertPayload: BulkUpsertSurveyQuestionPayload) => {
  const supabase = createClient();

  try {
    return await supabase.from("surveys_questions").upsert(bulkUpsertPayload).select("*").single();
  } catch (err: any) {
    throw new Error("Unable update survey question options for sv error.");
  }
};

export {
  upsertSurveyQuestion,
  updateSurveyQuestion,
  createSurveyQuestion,
  bulkUpsertSurveyQuestion,
  bulkCreateSurveyQuestion,
};
