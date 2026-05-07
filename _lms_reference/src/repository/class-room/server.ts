import { createSVClient } from "@/services/supabase/server";

import { SELECT_CLASSROOM_DETAIL_BY_SLUG } from "./query-select";

const getClassRoomBySlugServer = async (slug: string) => {
  const trimmedSlug = slug?.trim();
  if (!trimmedSlug) {
    return { data: null, error: null };
  }

  const supabase = await createSVClient();
  const { data, error } = await supabase
    .from("class_rooms")
    .select(SELECT_CLASSROOM_DETAIL_BY_SLUG)
    .eq("slug", trimmedSlug)
    .single();

  return { data, error };
};

export type GetClassRoomBySlugServerResponse = Awaited<ReturnType<typeof getClassRoomBySlugServer>>;

export { getClassRoomBySlugServer };
