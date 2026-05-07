import { Database } from "@/types/supabase.types";

export type GetFlashcardsQueryParams = {
  page?: number;
  pageSize?: number;
  organizationId?: string;
  search?: string;
};

export type CreateFlashcardPayload = Database["public"]["Tables"]["flashcards"]["Insert"];

export type UpdateFlashcardPayload = Database["public"]["Tables"]["flashcards"]["Update"] & { id: string };
