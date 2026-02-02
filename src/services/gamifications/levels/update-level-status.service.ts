import { DomainError } from "@/lib/errors/DomainError";
import { levelRepository } from "@/repository";

import { UpdateLevelStatusInput, UpdateLevelStatusResult } from "./levels.dto";

export class UpdateLevelStatusService {
  private organizationId: string;

  private allowedStatus = ["active", "inactive", "deleted"];

  constructor(organizationId: string) {
    this.organizationId = organizationId;
  }

  async execute(input: UpdateLevelStatusInput): Promise<UpdateLevelStatusResult> {
    if (!input.id) {
      throw new DomainError("Level id is required", "LEVEL_ID_REQUIRED", 400);
    }

    if (!this.allowedStatus.includes(input.status)) {
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
}
