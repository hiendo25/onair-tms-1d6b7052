import { supabase } from "@/services";

import { SectionInsert, SectionUpdate, SectionUpsert } from "./type";

const createSection = async (payload: SectionInsert) => {
  return await supabase.from("sections").insert(payload).select("*").single();
};

const upsertSection = async (upsertPayload: SectionUpsert) => {
  return await supabase.from("sections").upsert(upsertPayload.payload).select("*").single();
};
const bulkdeleteSections = async (sectionIds: string[]) => {
  return await supabase.from("sections").delete().in("id", sectionIds).select("*");
};

const deleteSection = async (sectionId: string) => {
  return await supabase.from("sections").delete().eq("id", sectionId);
};

const updateSection = async (payload: SectionUpdate) => {
  const { id: sectionId, ...restPayload } = payload;
  return await supabase.from("sections").update(payload).match({ id: sectionId }).select("*").single();
};

export { createSection, updateSection, bulkdeleteSections, deleteSection, upsertSection };
