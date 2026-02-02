import { NextRequest, NextResponse } from "next/server";

import { checkAssignmentAccess } from "@/services/assignments/assignment-access.service";
import { authenticateAndGetEmployee } from "@/services/auth/api-auth.helper";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const authResult = await authenticateAndGetEmployee(request);
    if ("error" in authResult) {
      return authResult.error;
    }

    const { id: assignmentId } = await params;
    if (!assignmentId) {
      return NextResponse.json({ error: "Assignment ID is required" }, { status: 400 });
    }

    const employeeId = request.nextUrl.searchParams.get("employeeId");
    if (!employeeId) {
      return NextResponse.json({ error: "Employee ID is required" }, { status: 400 });
    }

    const isAssigned = await checkAssignmentAccess(assignmentId, employeeId);

    return NextResponse.json({ isAssigned }, { status: 200 });
  } catch (error) {
    console.error("[API] Error checking assignment access:", error);
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Failed to check assignment access",
      },
      { status: 500 },
    );
  }
}
