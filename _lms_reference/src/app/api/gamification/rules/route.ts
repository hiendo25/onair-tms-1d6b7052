import { NextRequest, NextResponse } from "next/server";

import { gamificationRulesService } from "@/services";
import { authenticateAndGetEmployee } from "@/services/auth/api-auth.helper";

/**
 * GET /api/gamification/rules
 * Returns all gamification rules for the organization
 * If a rule doesn't exist in DB, returns default values
 */
export async function GET(request: NextRequest) {
  try {
    // Authenticate and get employee
    const authResult = await authenticateAndGetEmployee(request);
    if ("error" in authResult) {
      return authResult.error;
    }

    const { employee } = authResult;

    // Get rules for organization (with defaults for missing rules)
    const result = await gamificationRulesService.getRulesForOrganization(employee.organization_id);

    return NextResponse.json(result, { status: 200 });
  } catch (error) {
    console.error("Error fetching gamification rules:", error);
    const errorMessage =
      error instanceof Error
        ? error.message
        : "An unexpected error occurred while fetching gamification rules";

    return NextResponse.json({ success: false, message: errorMessage }, { status: 500 });
  }
}
