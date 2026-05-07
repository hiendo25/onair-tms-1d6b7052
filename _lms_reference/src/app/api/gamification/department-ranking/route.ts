/**
 * GET /api/gamification/department-ranking?departmentId=xxx&page=1&limit=50
 *
 * Get department-specific gamification ranking
 * Ranks employees by completion percentage (current_xp / max_possible_xp * 100)
 *
 * Query Parameters:
 *   - departmentId (required): The department's UUID
 *   - page (optional): Page number, default 1
 *   - limit (optional): Items per page, default 50, max 100
 *
 * Response:
 *   {
 *     "success": true,
 *     "data": {
 *       "employees": [
 *         {
 *           "employeeId": "uuid",
 *           "employeeCode": "EMP001",
 *           "fullName": "John Doe",
 *           "email": "john@example.com",
 *           "avatar": "https://...",
 *           "departmentId": "uuid",
 *           "departmentName": "Engineering",
 *           "currentXp": 2400,
 *           "maxPossibleXp": 3000,
 *           "completionPercentage": 80.00,
 *           "level": { "id": "uuid", "title": "Gold", "icon": "🥇", "scoreRequired": 1000 },
 *           "rank": 1
 *         }
 *       ],
 *       "total": 25,
 *       "page": 1,
 *       "limit": 50,
 *       "departmentId": "uuid"
 *     }
 *   }
 *
 * Errors:
 *   - 400: departmentId is required
 *   - 401: Unauthorized
 *   - 500: Server error
 */

import { NextRequest, NextResponse } from "next/server";
import { authenticateAndGetEmployee } from "@/services/auth/api-auth.helper";
import { getDepartmentGamificationRanking } from "@/services/gamifications/ranking";

export async function GET(request: NextRequest) {
  try {
    // Authenticate user and get employee
    const authResult = await authenticateAndGetEmployee(request);
    if ("error" in authResult) {
      return authResult.error;
    }
    const { employee } = authResult;

    // Get query parameters
    const searchParams = request.nextUrl.searchParams;
    const departmentId = searchParams.get("departmentId");
    const page = parseInt(searchParams.get("page") || "1", 10);
    const limit = parseInt(searchParams.get("limit") || "50", 10);

    // Validate department ID
    if (!departmentId) {
      return NextResponse.json(
        {
          error: "departmentId is required",
        },
        { status: 400 }
      );
    }

    // Get department ranking
    const data = await getDepartmentGamificationRanking(
      departmentId,
      employee.organization_id,
      page,
      limit
    );

    return NextResponse.json(
      {
        success: true,
        data,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("[API] Error fetching department ranking:", error);

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
