import { NextRequest, NextResponse } from "next/server";

import * as assignmentResultService from "@/services/assignment-results/assignment-result.service";
import { authenticateAndGetEmployee } from "@/services/auth/api-auth.helper";

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string; employeeId: string }> }
) {
  try {
    const authResult = await authenticateAndGetEmployee(request);
    if ("error" in authResult) {
      return authResult.error;
    }

    const params = await context.params;
    const { id: assignmentId, employeeId } = params;

    const submissionDetail = await assignmentResultService.getSubmissionDetailForViewer(
      assignmentId,
      employeeId,
      {
        id: authResult.employee.id,
        employeeType: authResult.employee.employee_type,
      },
    );

    return NextResponse.json(submissionDetail, { status: 200 });
  } catch (error) {
    console.error("Error fetching submission detail:", error);

    if (error instanceof assignmentResultService.SubmissionAccessError) {
      return NextResponse.json({ error: error.message }, { status: error.statusCode });
    }

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
    const authResult = await authenticateAndGetEmployee(request);
    if ("error" in authResult) {
      return authResult.error;
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

    const result = await assignmentResultService.saveGradeForViewer(
      {
        assignmentId,
        employeeId,
        questionGrades,
        overallFeedback,
      },
      {
        id: authResult.employee.id,
        employeeType: authResult.employee.employee_type,
      },
    );

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

    if (error instanceof assignmentResultService.SubmissionAccessError) {
      return NextResponse.json({ error: error.message }, { status: error.statusCode });
    }

    const errorMessage = error instanceof Error
      ? error.message
      : "Có lỗi xảy ra khi lưu điểm";

    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
}
