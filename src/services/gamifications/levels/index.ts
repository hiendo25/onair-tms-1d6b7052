import { DomainError } from "@/lib/errors/DomainError";
import { levelRepository } from "@/repository";
import { createClient } from "@/services/supabase/client";
import type { LevelInfo } from "@/types/gamification.types";

import {
  CreateLevelInput,
  CreateLevelResult,
  DeleteLevelResult,
  GetLevelsInput,
  GetLevelsResult,
  UpdateLevelInput,
  UpdateLevelResult,
  UpdateLevelStatusInput,
  UpdateLevelStatusResult,
} from "./levels.dto";
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

export async function createLevel(input: CreateLevelInput): Promise<CreateLevelResult> {
  const record = await levelRepository.createLevel({
    created_by: input.authorId,
    description: input.description,
    icon: input.icon,
    organization_id: input.organizationId,
    score_required: input.scoreRequired,
    title: input.title,
  });

  return {
    id: record.id,
    title: record.title,
    description: record.description,
    icon: record.icon,
    author: {
      id: record.createdBy.id,
      fullName: record.createdBy.profiles?.full_name || "",
    },
    organization: {
      id: record.organizations.id,
      name: record.organizations.name,
    },
    scoreRequired: record.score_required,
    status: record.status,
    createdAt: record.created_at,
    updatedAt: record.updated_at,
  };
}

export async function updateLevel(input: UpdateLevelInput): Promise<UpdateLevelResult> {
  if (!input.id) {
    throw new DomainError("Level id is required", "LEVEL_ID_REQUIRED", 400);
  }

  const record = await levelRepository.updateLevel({
    description: input.description,
    icon: input.icon,
    id: input.id,
    score_required: input.scoreRequired,
    title: input.title,
  });

  return {
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
  };
}

export async function updateLevelStatus(input: UpdateLevelStatusInput): Promise<UpdateLevelStatusResult> {
  const ALLOWED_STATUS = ["active", "inactive", "deleted"] as const;

  if (!input.id) {
    throw new DomainError("Level id is required", "LEVEL_ID_REQUIRED", 400);
  }

  if (!ALLOWED_STATUS.includes(input.status)) {
    throw new DomainError("Invalid level status", "LEVEL_STATUS_INVALID", 400);
  }

  const record = await levelRepository.updateStatusLevel({
    id: input.id,
    status: input.status,
  });

  return {
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
  };
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

export async function deleteLevel(recordId: string): Promise<DeleteLevelResult> {
  const record = await levelRepository.updateStatusLevel({
    id: recordId,
    status: "deleted",
  });

  return {
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
  };
}
