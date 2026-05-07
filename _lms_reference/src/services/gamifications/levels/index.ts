import { DomainError } from "@/lib/errors/DomainError";
import { levelRepository } from "@/repository";
import { createClient } from "@/services/supabase/client";
import type { LevelInfo } from "@/types/gamification.types";

import { DeleteLevelResult, GetLevelsInput, GetLevelsResult } from "./levels.dto";
/**
 * Get all levels for an organization sorted by score (ascending)
 * @param organizationId - The organization's UUID
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

const MAX_PAGE_SIZE = 100;

export async function getLevels(input: GetLevelsInput): Promise<GetLevelsResult> {
  const { organizationId } = input;

  const page = input?.page && input?.page > 0 ? input.page : 1;
  const pageSize = input?.pageSize && input.pageSize > 0 ? Math.min(input.pageSize, MAX_PAGE_SIZE) : 10;
  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;

  if (!organizationId) {
    throw new DomainError("organizationId in not defined", "BAD_REQUEST", 400);
  }

  const { data: records, count } = await levelRepository.getLevels({ from, to, organizationId });

  const items = records.map<GetLevelsResult["data"][number]>((record) => ({
    id: record.id,
    title: record.title,
    description: record.description,
    createdAt: record.created_at,
    author: {
      id: record.createdBy.id,
      fullName: record.createdBy.profiles?.full_name || "",
    },
    icon: record.icon,
    organization: {
      id: record.organizations.id,
      name: record.organizations.name,
    },
    scoreRequired: record.score_required,
    status: record.status,
    updatedAt: record.updated_at,
  }));

  return {
    data: items,
    page,
    pageSize,
    total: count || 0,
  };
}
