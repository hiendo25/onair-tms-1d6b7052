import { DomainError } from "@/lib/errors/DomainError";
import { levelRepository } from "@/repository";

import { CreateLevelInput, CreateLevelResult } from "./levels.dto";

export class CreateLevelService {
  private organizationId: string;

  constructor(organizationId: string) {
    this.organizationId = organizationId;
  }

  async execute(input: CreateLevelInput): Promise<CreateLevelResult> {
    const score = Number(input.scoreRequired);

    if (!Number.isInteger(score) || score < 0) {
      throw new DomainError("Điểm số không hợp lệ.", "SCORE_INVALID", 400);
    }

    console.log(input.scoreRequired);

    await this.validateLevelScore(input.scoreRequired);

    const record = await levelRepository.createLevel({
      created_by: input.authorId,
      description: input.description,
      icon: input.icon,
      organization_id: this.organizationId,
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

  private async validateLevelScore(score: number) {
    const levelsSameScores = await levelRepository.getLevelsByScore(score, this.organizationId);

    console.log(levelsSameScores);
    if (levelsSameScores.length) {
      throw new DomainError("Điểm số đã tồn tại.", "SCORE_EXISTED", 409);
    }
  }
}
