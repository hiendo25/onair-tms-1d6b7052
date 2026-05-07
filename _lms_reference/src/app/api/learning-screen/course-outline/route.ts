import { NextRequest, NextResponse } from "next/server";

import { createSVClient, learningScreenService } from "@/services";

export async function GET(request: NextRequest) {
  try {
    const courseId = request.nextUrl.searchParams.get("courseId") ?? "";
    const includeProgress = request.nextUrl.searchParams.get("includeProgress") === "true";
    const learningPathId = request.nextUrl.searchParams.get("learningPathId");
    const trimmedLearningPathId = learningPathId?.trim() ? learningPathId : null;
    const classRoomId = request.nextUrl.searchParams.get("classRoomId");
    const trimmedClassRoomId = classRoomId?.trim() ? classRoomId : null;
    const employeeId = request.nextUrl.searchParams.get("employeeId");
    const trimmedEmployeeId = employeeId?.trim() ? employeeId.trim() : null;

    if (!courseId.trim()) {
      return NextResponse.json(
        { error: "courseId is required" },
        { status: 400 },
      );
    }

    const result = await learningScreenService.getCourseLearningOutline(courseId, {
      includeProgress,
      learningPathId: trimmedLearningPathId,
      classRoomId: trimmedClassRoomId,
      employeeId: trimmedEmployeeId,
    });

    return NextResponse.json(result, { status: 200 });
  } catch (error) {
    console.error("[LearningScreen] Failed to fetch course outline:", error);
    const message =
      error instanceof Error ? error.message : "Không thể tải dữ liệu khoá học";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
