import { NextRequest } from "next/server";

import { http } from "@/lib/api/http-status";
import { requireAuth } from "@/lib/auth/require-auth";
import { DomainError } from "@/lib/errors/DomainError";
import { DeleteCourseService } from "@/services/course/delete-course.service";

export async function DELETE(request: NextRequest, ctx: RouteContext<"/api/courses/[courseId]">) {
  try {
    const { organizationId } = await requireAuth(request);

    const courseId = (await ctx.params).courseId;

    const data = await new DeleteCourseService(organizationId).execute(courseId);

    return http.ok(data);
  } catch (err) {
    if (err instanceof DomainError) {
      return http.fromDomainError(err);
    }
    return http.serverError("Mark all read failure");
  }
}
