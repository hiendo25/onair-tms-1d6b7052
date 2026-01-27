import { NextRequest, NextResponse } from "next/server";

import * as assignmentResultService from "@/services/assignment-results/assignment-result.service";

interface StartAttemptRequest {
  employeeId: string;
}

export async function POST(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  try {
    const params = await context.params;
    const assignment_config_id = params.id;
    const body: StartAttemptRequest = await request.json();

    if (!body.employeeId) {
      return NextResponse.json({ error: "Missing required field: employeeId" }, { status: 400 });
    }

    const attempt = await assignmentResultService.startAssignmentAttempt(assignment_config_id, body.employeeId);

    return NextResponse.json({ data: attempt }, { status: 200 });
  } catch (error) {
    console.error("Error starting assignment attempt:", error);

    const errorMessage = error instanceof Error ? error.message : "Có lỗi xảy ra khi bắt đầu làm bài.";

    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
