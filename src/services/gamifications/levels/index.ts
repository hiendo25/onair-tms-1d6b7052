import { createClient } from "@/services/supabase/client";
import type { LevelInfo } from "@/types/gamification.types";

/**
 * Get all levels for an organization sorted by score (ascending)
 * @param organizationId - The organization's UUID
 * @returns Array of levels sorted from lowest to highest score
 */
export async function getAllLevels(organizationId: string): Promise<LevelInfo[]> {
  const supabase = createClient();

  const { data, error } = await supabase
    .from("levels")
    .select("id, title, description, icon, score_required")
    .eq("organization_id", organizationId)
    .eq("status", "active")
    .order("score_required", { ascending: true });

  if (error) throw error;

  return (data || []).map((level) => ({
    id: level.id,
    title: level.title,
    description: level.description,
    icon: level.icon,
    scoreRequired: level.score_required,
  }));
}
