import { NextRequest, NextResponse } from "next/server";

import { getAssignmentQuestions } from "@/services/assignments/assignment.service";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: assignmentId } = await params;

    const questions = await getAssignmentQuestions(assignmentId);

    return NextResponse.json(questions, { status: 200 });
  } catch (error) {
    console.error("Error fetching assignment questions:", error);
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Failed to fetch assignment questions",
      },
      { status: 500 }
    );
  }
}

