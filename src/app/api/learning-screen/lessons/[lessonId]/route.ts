import { NextRequest, NextResponse } from "next/server";
import { learningScreenService } from "@/services";

interface RouteContext {
  params: Promise<{
    lessonId: string;
  }>;
}

export async function GET(_request: NextRequest, context: RouteContext) {
  try {
    const { lessonId = "" } = await context.params;

    if (!lessonId.trim()) {
      return NextResponse.json(
        { error: "lessonId is required" },
        { status: 400 },
      );
    }

    const lesson = await learningScreenService.getLessonLearningDetail(lessonId);
    return NextResponse.json(lesson, { status: 200 });
  } catch (error) {
    console.error("[LearningScreen] Failed to fetch lesson detail:", error);
    const message =
      error instanceof Error ? error.message : "Không thể tải dữ liệu bài học";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
