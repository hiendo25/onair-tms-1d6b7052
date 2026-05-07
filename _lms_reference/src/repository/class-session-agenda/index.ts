import { supabase } from "@/services";

import { CreateSessionAgendasPayload, UpSertSessionAgendaPayload } from "./type";
export * from "./type";

const createAgendas = async (payload: CreateSessionAgendasPayload[]) => {
  try {
    return await supabase.from("class_sessions_agendas").insert(payload).select();
  } catch (err: any) {
    console.error("Unexpected error:", err);
    throw new Error(err.message ?? "Unknown error create Agendas");
  }
};
const deleteAgendas = async (ids: string[]) => {
  try {
    return await supabase.from("class_sessions_agendas").delete().in("id", ids).select(`id, title, class_session_id`);
  } catch (err: any) {
    console.error("Unexpected error:", err);
    throw new Error(err.message ?? "Unknown error create Agendas");
  }
};

const bulkUpsertAgendas = async (payload: UpSertSessionAgendaPayload[]) => {
  try {
    return await supabase
      .from("class_sessions_agendas")
      .upsert(payload.map((pl) => pl.payload))
      .select(`id, title, description, class_session_id`);
  } catch (err: any) {
    console.error("Unexpected error:", err);
    throw new Error(err.message ?? "Unknown error create Agendas");
  }
};

const upsertAgenda = async (payload: UpSertSessionAgendaPayload) => {
  try {
    return await supabase
      .from("class_sessions_agendas")
      .upsert(payload.payload)
      .select(`id, title, description, class_session_id`)
      .single();
  } catch (err: any) {
    console.error("Unexpected error:", err);
    throw new Error(err.message ?? "Unknown error create Agendas");
  }
};

export { createAgendas, deleteAgendas, bulkUpsertAgendas, upsertAgenda };
