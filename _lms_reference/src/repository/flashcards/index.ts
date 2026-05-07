import { createClient } from "@/services/supabase/client";

import { CreateFlashcardPayload, GetFlashcardsQueryParams, UpdateFlashcardPayload } from "./type";

const getFlashcards = async (params?: GetFlashcardsQueryParams) => {
  const supabase = createClient();
  const { page = 1, pageSize = 20, organizationId, search } = params || {};
  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;

  try {
    let query = supabase.from("flashcards").select(
      `
        id,
        name,
        content,
        image_url,
        status,
        created_at,
        created_by
      `,
      { count: "exact" }
    );

    if (organizationId) {
      query = query.eq("organization_id", organizationId);
    }

    // Filter out soft-deleted records
    query = query.is("deleted_at", null);

    if (search) {
      query = query.or(`name.ilike.%${search}%,content.ilike.%${search}%`);
    }

    return query.order("created_at", { ascending: false }).range(from, to);
  } catch {
    throw new Error("Failed to fetch flashcards");
  }
};
export type GetFlashcardsResponse = Awaited<ReturnType<typeof getFlashcards>>;

const getFlashcardById = async (id: string) => {
  const supabase = createClient();
  try {
    const { data, error } = await supabase
      .from("flashcards")
      .select(
        `
        id,
        name,
        content,
        image_url,
        status,
        created_at,
        created_by,
        organization_id
      `
      )
      .eq("id", id)
      .is("deleted_at", null)
      .single();

    if (!data || error) {
      throw new Error(error.message);
    }
    return data;
  } catch (err) {
    const error = err as { message?: string };
    throw new Error(`Failed to fetch flashcard: ${error?.message}`);
  }
};
export type GetFlashcardByIdResponse = Awaited<ReturnType<typeof getFlashcardById>>;

const createFlashcard = async (payload: CreateFlashcardPayload) => {
  const supabase = createClient();
  try {
    const { data, error } = await supabase
      .from("flashcards")
      .insert(payload)
      .select("*")
      .single();

    if (!data || error) {
      throw new Error(error.message);
    }
    return data;
  } catch (err) {
    const error = err as { message?: string };
    throw new Error(`Failed to create flashcard: ${error?.message}`);
  }
};
export type CreateFlashcardResponse = Awaited<ReturnType<typeof createFlashcard>>;

const updateFlashcard = async (payload: UpdateFlashcardPayload) => {
  const supabase = createClient();
  try {
    const { id: recordId, ...restPayload } = payload;
    const { data, error } = await supabase
      .from("flashcards")
      .update(restPayload)
      .eq("id", recordId)
      .select("*")
      .single();

    if (!data || error) {
      throw new Error(error.message);
    }
    return data;
  } catch (err) {
    const error = err as { message?: string };
    throw new Error(`Failed to update flashcard: ${error?.message}`);
  }
};
export type UpdateFlashcardResponse = Awaited<ReturnType<typeof updateFlashcard>>;

const deleteFlashcard = async (id: string) => {
  const supabase = createClient();
  try {
    const { data, error } = await supabase
      .from("flashcards")
      .update({ deleted_at: new Date().toISOString() })
      .eq("id", id)
      .select("*")
      .single();

    if (!data || error) {
      throw new Error(error.message);
    }
    return data;
  } catch (err) {
    const error = err as { message?: string };
    throw new Error(`Failed to delete flashcard: ${error?.message}`);
  }
};
export type DeleteFlashcardResponse = Awaited<ReturnType<typeof deleteFlashcard>>;

const toggleFlashcard = async (id: string, status: "active" | "inactive") => {
  const supabase = createClient();
  try {
    const { data, error } = await supabase
      .from("flashcards")
      .update({ status })
      .eq("id", id)
      .select("*")
      .single();

    if (!data || error) {
      throw new Error(error.message);
    }
    return data;
  } catch (err) {
    const error = err as { message?: string };
    throw new Error(`Failed to toggle flashcard: ${error?.message}`);
  }
};
export type ToggleFlashcardResponse = Awaited<ReturnType<typeof toggleFlashcard>>;

export {
  getFlashcards,
  getFlashcardById,
  createFlashcard,
  updateFlashcard,
  deleteFlashcard,
  toggleFlashcard,
};
