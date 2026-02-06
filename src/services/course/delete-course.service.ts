import { DomainError } from "@/lib/errors/DomainError";
import { classRoomRepository, coursesRepository } from "@/repository";

import { DeleteCourseResult } from "./dto/delete-course.dto";
export class DeleteCourseService {
  private organizationId: string;

  constructor(organizationId: string) {
    this.organizationId = organizationId;
  }

  async execute(courseId: string): Promise<DeleteCourseResult> {
    if (!courseId) {
      throw new DomainError("Thiếu courseId", "COURSE_ID_MISSING", 400);
    }
    await this.ensureCourseNotAssignedToClassRoom(courseId);

    const data = await coursesRepository.deleteCourseById(courseId);

    return {
      id: data.id,
      name: data.title || "",
      slug: data.slug,
    };
  }

  private async ensureCourseNotAssignedToClassRoom(courseId: string) {
    const data = await classRoomRepository.getClassRoomByCourseId(courseId);

    if (data.length) {
      throw new DomainError("Môn học đã được gán vào lớp, không thể xóa", "COURSE_IS_ASSIGNED_IN_CLASSROOM", 422);
    }
  }
}
