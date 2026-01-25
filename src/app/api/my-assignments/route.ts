import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

import { employeesRepository } from "@/repository";
import { createSVClient } from "@/services";
import { getMyAssignments } from "@/services/assignments/assignment.service";
import type { GetMyAssignmentsParams, MyAssignmentStatusFilter } from "@/types/dto/assignments";
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    // const organizationId = searchParams.get("organizationId");

    // if (!organizationId) {
    //   return NextResponse.json({ error: "Organization ID is required" }, { status: 400 });
    // }

    const supabase = await createSVClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    const cookieStore = await cookies();

    const organizationId = cookieStore.get("organization_id")?.value;

    console.log({ organizationId });
    if (authError || !user) {
      return NextResponse.json({ error: "User not authenticated" }, { status: 401 });
    }

    if (!organizationId) {
      return NextResponse.json({ error: "You has no organization" }, { status: 403 });
    }
    // Get employee ID from user ID
    const employee = await employeesRepository.getCurrentEmployee(user.id, organizationId);

    if (!employee) {
      return NextResponse.json({ error: "Employee not found" }, { status: 404 });
    }

    // Get pagination, search, and status parameters from query string
    const statusParam = searchParams.get("status") as MyAssignmentStatusFilter | null;

    const params: GetMyAssignmentsParams = {
      page: parseInt(searchParams.get("page") || "0", 10),
      limit: parseInt(searchParams.get("limit") || "25", 10),
      search: searchParams.get("search") || undefined,
      status: statusParam || undefined,
      organizationId
    };

    const myAssignments = await getMyAssignments(employee.id, params);

    return NextResponse.json(myAssignments, { status: 200 });
  } catch (error) {
    console.error("Error fetching my assignments:", error);
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Failed to fetch my assignments",
      },
      { status: 500 },
    );
  }
}
