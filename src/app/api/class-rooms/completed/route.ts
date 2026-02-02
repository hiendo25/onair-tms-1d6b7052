import { NextRequest, NextResponse } from "next/server";

import { createClient } from "@/services";
import { authenticateAndGetEmployee } from "@/services/auth/api-auth.helper";

export async function GET(request: NextRequest) {
  try {
    // Authenticate user and get employee
    const authResult = await authenticateAndGetEmployee(request);
    if ("error" in authResult) {
      return authResult.error;
    }
    const { employee } = authResult;

    // Get type filter from query params
    const type = request.nextUrl.searchParams.get("type");
    const classTypeFilter = type === "room" || type === "learning_path" ? type : null;

    const supabase = createClient();

    // Call the RPC function
    const { data, error } = await supabase.rpc("get_completed_class_rooms", {
      employee_id: employee.id,
      class_type_filter: classTypeFilter || undefined,
    });

    if (error) {
      console.error("[API] Error fetching completed class rooms:", error);
      return NextResponse.json(
        { error: error.message || "Failed to fetch completed class rooms" },
        { status: 400 },
      );
    }

    return NextResponse.json(data, { status: 200 });
  } catch (error) {
    console.error("[API] Error fetching completed class rooms:", error);

    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Failed to fetch completed class rooms",
      },
      { status: 500 },
    );
  }
}
