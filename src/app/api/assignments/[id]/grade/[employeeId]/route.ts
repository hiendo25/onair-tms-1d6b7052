import { NextRequest, NextResponse } from "next/server";
import { createSVClient } from "@/services";
import * as assignmentResultService from "@/services/assignment-results/assignment-result.service";

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string; employeeId: string }> }
) {
  try {
    const supabase = await createSVClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: "User not authenticated" },
        { status: 401 }
      );
    }

    const params = await context.params;
    const { id: assignmentId, employeeId } = params;

    const submissionDetail = await assignmentResultService.getSubmissionDetail(
      assignmentId,
      employeeId
    );

    return NextResponse.json(submissionDetail, { status: 200 });
  } catch (error) {
    console.error("Error fetching submission detail:", error);

    const errorMessage = error instanceof Error
      ? error.message
      : "Có lỗi xảy ra khi tải thông tin bài nộp";

    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
}

export async function POST(
  request: NextRequest,
  context: { params: Promise<{ id: string; employeeId: string }> }
) {
  try {
    const supabase = await createSVClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: "User not authenticated" },
        { status: 401 }
      );
    }

    const params = await context.params;
    const { id: assignmentId, employeeId } = params;

    const body = await request.json();
    const { questionGrades, overallFeedback } = body;

    if (!questionGrades || !Array.isArray(questionGrades)) {
      return NextResponse.json(
        { error: "Dữ liệu điểm không hợp lệ" },
        { status: 400 }
      );
    }

    const result = await assignmentResultService.saveGrade({
      assignmentId,
      employeeId,
      questionGrades,
      overallFeedback,
    });

    return NextResponse.json(
      {
        success: true,
        message: "Lưu điểm thành công",
        totalScore: result.totalScore,
        maxScore: result.maxScore,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error saving grade:", error);

    const errorMessage = error instanceof Error
      ? error.message
      : "Có lỗi xảy ra khi lưu điểm";

    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
}

