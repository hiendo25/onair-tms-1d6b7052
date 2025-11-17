import { NextRequest, NextResponse } from "next/server";
import { learningScreenService } from "@/services";

export async function GET(request: NextRequest) {
  try {
    const courseId = request.nextUrl.searchParams.get("courseId") ?? "";

    if (!courseId.trim()) {
      return NextResponse.json(
        { error: "courseId is required" },
        { status: 400 },
      );
    }

    const result = await learningScreenService.getCourseLearningOutline(courseId);

    return NextResponse.json(result, { status: 200 });
  } catch (error) {
    console.error("[LearningScreen] Failed to fetch course outline:", error);
    const message =
      error instanceof Error ? error.message : "Không thể tải dữ liệu khoá học";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
