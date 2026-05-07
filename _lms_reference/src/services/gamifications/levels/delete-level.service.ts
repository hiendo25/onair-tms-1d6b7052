import { levelRepository } from "@/repository";

import { DeleteLevelResult } from "./levels.dto";

export class DeleteLevelService {
  private organizationId: string;

  constructor(organizationId: string) {
    this.organizationId = organizationId;
  }

  async execute(recordId: string): Promise<DeleteLevelResult> {
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
}
