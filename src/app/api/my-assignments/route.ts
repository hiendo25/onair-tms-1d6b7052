import { NextRequest, NextResponse } from "next/server";
import { createSVClient } from "@/services";
import { getMyAssignments } from "@/services/assignments/assignment.service";
import { employeesRepository } from "@/repository";
import type { GetMyAssignmentsParams, MyAssignmentStatusFilter } from "@/types/dto/assignments";

export async function GET(request: NextRequest) {
  try {
    const supabase = await createSVClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: "User not authenticated" },
        { status: 401 }
      );
    }

    // Get employee ID from user ID
    const employee = await employeesRepository.getEmployeeByUserId(user.id);

    if (!employee) {
      return NextResponse.json(
        { error: "Employee not found" },
        { status: 404 }
      );
    }

    // Get pagination, search, and status parameters from query string
    const searchParams = request.nextUrl.searchParams;
    const statusParam = searchParams.get("status") as MyAssignmentStatusFilter | null;

    const params: GetMyAssignmentsParams = {
      page: parseInt(searchParams.get("page") || "0", 10),
      limit: parseInt(searchParams.get("limit") || "25", 10),
      search: searchParams.get("search") || undefined,
      status: statusParam || undefined,
    };

    const myAssignments = await getMyAssignments(employee.id, params);

    return NextResponse.json(myAssignments, { status: 200 });
  } catch (error) {
    console.error("Error fetching my assignments:", error);
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Failed to fetch my assignments",
      },
      { status: 500 }
    );
  }
}

