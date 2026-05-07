import { NextRequest, NextResponse } from "next/server";

import {
  isTargetTriggerType,
  TARGET_TRIGGER_TYPES,
} from "@/constants/gamification-rules.constant";
import { gamificationRulesService } from "@/services";
import { authenticateAndGetEmployee } from "@/services/auth/api-auth.helper";
import type { Database } from "@/types/supabase.types";

type RuleTriggerType = Database["public"]["Enums"]["rule_trigger_type"];

interface ToggleRuleRequest {
  trigger_type: RuleTriggerType;
}

/**
 * POST /api/gamification/rules/toggle
 * Toggles the is_active status of a rule
 * - If rule exists: toggle is_active
 * - If rule doesn't exist: create it with default values and set is_active to true
 */
export async function POST(request: NextRequest) {
  try {
    // Authenticate and get employee
    const authResult = await authenticateAndGetEmployee(request);
    if ("error" in authResult) {
      return authResult.error;
    }

    const { employee } = authResult;

    // Parse request body
    const payload: ToggleRuleRequest = await request.json();
    const { trigger_type } = payload;

    if (!trigger_type) {
      return NextResponse.json(
        { success: false, message: "trigger_type is required" },
        { status: 400 }
      );
    }

    // Validate trigger_type is one of the supported types using type guard
    if (!isTargetTriggerType(trigger_type)) {
      return NextResponse.json(
        {
          success: false,
          message: `Invalid trigger_type. Only ${TARGET_TRIGGER_TYPES.join(", ")} are supported.`
        },
        { status: 400 }
      );
    }

    // TypeScript now knows trigger_type is TargetTriggerType
    const targetTriggerType = trigger_type;

    // Toggle or create rule via service
    const result = await gamificationRulesService.toggleRule(employee.organization_id, targetTriggerType);

    return NextResponse.json(result, { status: 200 });
  } catch (error) {
    console.error("Error toggling gamification rule:", error);
    const errorMessage =
      error instanceof Error
        ? error.message
        : "An unexpected error occurred while toggling gamification rule";

    return NextResponse.json({ success: false, message: errorMessage }, { status: 500 });
  }
}
