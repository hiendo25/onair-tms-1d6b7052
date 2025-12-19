import { supabase } from "@/services";

import { CreateSectionPayload, UpdateSectionPayload, UpsertSectionPayload } from "./type";

const createSection = async (payload: CreateSectionPayload) => {
  try {
    return await supabase.from("sections").insert(payload).select("*").single();
  } catch (err: any) {
    console.log(err);
    throw new Error(err?.message);
  }
};

const upsertSection = async (upsertPayload: UpsertSectionPayload) => {
  try {
    return await supabase.from("sections").upsert(upsertPayload.payload).select("*").single();
  } catch (err: any) {
    console.log(err);
    throw new Error(err?.message);
  }
};
const bulkdeleteSections = async (sectionIds: string[]) => {
  try {
    return await supabase.from("sections").delete().in("id", sectionIds).select("*");
  } catch (err: any) {
    console.log(err);
    throw new Error(err?.message);
  }
};

const deleteSection = async (sectionId: string) => {
  try {
    return await supabase.from("sections").delete().eq("id", sectionId);
  } catch (err: any) {
    console.log(err);
    throw new Error(err?.message);
  }
};

const updateSection = async (payload: UpdateSectionPayload) => {
  try {
    const { id: sectionId, ...restPayload } = payload;
    return await supabase.from("sections").update(payload).match({ id: sectionId }).select("*").single();
  } catch (err: any) {
    console.log(err);
    throw new Error(err?.message);
  }
};

export { createSection, updateSection, bulkdeleteSections, deleteSection, upsertSection };
