import { DomainError } from "@/lib/errors/DomainError";
import { levelRepository } from "@/repository";

import { UpdateLevelInput, UpdateLevelResult } from "./levels.dto";

export class UpdateLevelService {
  private organizationId: string;

  constructor(organizationId: string) {
    this.organizationId = organizationId;
  }

  async execute(input: UpdateLevelInput): Promise<UpdateLevelResult> {
    const score = Number(input.scoreRequired);

    if (!Number.isInteger(score) || score < 0) {
      throw new DomainError("Điểm số không hợp lệ.", "SCORE_INVALID", 400);
    }

    console.log(input.scoreRequired);

    await this.validateLevelScore(input.scoreRequired, input.id);

    const record = await levelRepository.updateLevel({
      description: input.description,
      icon: input.icon,
      score_required: input.scoreRequired,
      title: input.title,
      id: input.id,
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

  private async validateLevelScore(score: number, recordId: string) {
    const levelsSameScores = await levelRepository.getLevelsByScore(score, this.organizationId);

    const duplicated = levelsSameScores.some((level) => level.id !== recordId);

    if (levelsSameScores.length > 1 || (levelsSameScores.length === 1 && duplicated)) {
      throw new DomainError("Điểm số đã tồn tại.", "SCORE_EXISTED", 409);
    }
  }
}
