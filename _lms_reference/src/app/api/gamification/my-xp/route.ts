/**
 * GET /api/gamification/my-xp
 *
 * Get current employee's gamification XP and level information
 * Includes current XP, current level, and XP needed for next level
 */

import { NextRequest, NextResponse } from "next/server";

import { authenticateAndGetEmployee } from "@/services/auth/api-auth.helper";
import { getEmployeeGamificationXp } from "@/services/gamifications/xp";

export async function GET(request: NextRequest) {
  try {
    // Authenticate user and get employee
    const authResult = await authenticateAndGetEmployee(request);
    if ("error" in authResult) {
      return authResult.error;
    }
    const { employee } = authResult;

    // Get employee's gamification XP and level data
    const data = await getEmployeeGamificationXp(
      employee.id,
      employee.organization_id
    );

    return NextResponse.json(
      {
        success: true,
        data,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("[API] Error fetching gamification XP:", error);

    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Failed to fetch gamification XP",
      },
      { status: 500 }
    );
  }
}
