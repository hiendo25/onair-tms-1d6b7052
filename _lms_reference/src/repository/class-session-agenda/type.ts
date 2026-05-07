import { ClassSessionAgenda } from "@/model/class-session-agenda.model";

export type CreateSessionAgendasPayload = Pick<
  ClassSessionAgenda,
  "title" | "description" | "end_at" | "start_at" | "thumbnail_url" | "class_session_id"
>;

export type UpdateSessionAgendaPayload = Pick<
  ClassSessionAgenda,
  "id" | "title" | "description" | "end_at" | "start_at" | "thumbnail_url"
>;
export type UpSertSessionAgendaPayload =
  | { action: "create"; payload: CreateSessionAgendasPayload }
  | {
      action: "update";
      payload: UpdateSessionAgendaPayload;
    };
