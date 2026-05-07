import { NextRequest, NextResponse } from "next/server";

import { gamificationRulesRepository } from "@/repository";
import { authenticateAndGetEmployee } from "@/services/auth/api-auth.helper";
import type { Database } from "@/types/supabase.types";

type GamificationRuleUpdate = Pick<
  Database["public"]["Tables"]["gamification_rules"]["Update"],
  "rule_name" | "xp_amount" | "is_active" | "conditions" | "priority" | "max_times_per_day" | "max_times_per_week" | "max_times_total"
>;

interface UpdateRuleRequest extends Partial<GamificationRuleUpdate> {}

/**
 * PATCH /api/gamification/rules/[id]
 * Updates a gamification rule
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Authenticate and get employee
    const authResult = await authenticateAndGetEmployee(request);
    if ("error" in authResult) {
      return authResult.error;
    }

    const { id } = await params;

    if (!id) {
      return NextResponse.json(
        { success: false, message: "Rule ID is required" },
        { status: 400 }
      );
    }

    // Parse request body
    const payload: UpdateRuleRequest = await request.json();

    // Validate at least one field is provided
    if (Object.keys(payload).length === 0) {
      return NextResponse.json(
        { success: false, message: "No fields to update" },
        { status: 400 }
      );
    }

    // Update the rule
    const result = await gamificationRulesRepository.updateGamificationRule(id, payload);

    return NextResponse.json(
      {
        success: true,
        message: "Rule updated successfully",
        data: result,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error updating gamification rule:", error);
    const errorMessage =
      error instanceof Error
        ? error.message
        : "An unexpected error occurred while updating gamification rule";

    return NextResponse.json({ success: false, message: errorMessage }, { status: 500 });
  }
}
