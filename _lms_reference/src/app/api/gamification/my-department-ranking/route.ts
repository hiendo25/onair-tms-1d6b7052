/**
 * GET /api/gamification/my-department-ranking
 *
 * Get current employee's department ranking and position
 *
 * Response:
 *   {
 *     "success": true,
 *     "data": {
 *       "employeeId": "uuid",
 *       "employeeCode": "EMP001",
 *       "fullName": "John Doe",
 *       "email": "john@example.com",
 *       "avatar": "https://...",
 *       "departmentId": "uuid",
 *       "departmentName": "Engineering",
 *       "currentXp": 2400,
 *       "maxPossibleXp": 3000,
 *       "completionPercentage": 80.00,
 *       "level": { "id": "uuid", "title": "Gold", "icon": "🥇", "scoreRequired": 1000 },
 *       "rank": 5
 *     }
 *   }
 *
 * Errors:
 *   - 401: Unauthorized
 *   - 404: Employee not found in department ranking
 *   - 500: Server error
 */

import { NextRequest, NextResponse } from "next/server";
import { authenticateAndGetEmployee } from "@/services/auth/api-auth.helper";
import { getEmployeeDepartmentRanking } from "@/services/gamifications/ranking";

export async function GET(request: NextRequest) {
  try {
    // Authenticate user and get employee
    const authResult = await authenticateAndGetEmployee(request);
    if ("error" in authResult) {
      return authResult.error;
    }
    const { employee } = authResult;

    // Get employee's department ranking
    const data = await getEmployeeDepartmentRanking(
      employee.id,
      employee.organization_id
    );

    if (!data) {
      return NextResponse.json(
        {
          error: "Employee not found in department ranking",
        },
        { status: 404 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        data,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("[API] Error fetching my department ranking:", error);

    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Failed to fetch department ranking",
      },
      { status: 500 }
    );
  }
}
