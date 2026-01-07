import { NextRequest, NextResponse } from "next/server";

import {
  isTargetTriggerType,
  TARGET_TRIGGER_TYPES,
  type TargetTriggerType,
} from "@/constants/gamification-rules.constant";
import { authenticateAndGetEmployee } from "@/services/auth/api-auth.helper";
import { gamificationRulesService } from "@/services";

interface SaveRuleInput {
  trigger_type: string;
  xp_amount: number;
  is_active: boolean;
}

interface SaveRulesRequest {
  rules: SaveRuleInput[];
}

/**
 * POST /api/gamification/rules/save
 * Saves multiple gamification rules at once
 * Creates new rules or updates existing ones
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
    const payload: SaveRulesRequest = await request.json();
    const { rules } = payload;

    if (!rules || !Array.isArray(rules) || rules.length === 0) {
      return NextResponse.json(
        { success: false, message: "Rules array is required" },
        { status: 400 }
      );
    }

    // Validate all rules
    for (const rule of rules) {
      if (!rule.trigger_type) {
        return NextResponse.json(
          { success: false, message: "Each rule must have a trigger_type" },
          { status: 400 }
        );
      }

      if (!isTargetTriggerType(rule.trigger_type as any)) {
        return NextResponse.json(
          {
            success: false,
            message: `Invalid trigger_type: ${rule.trigger_type}. Only ${TARGET_TRIGGER_TYPES.join(", ")} are supported.`,
          },
          { status: 400 }
        );
      }

      if (typeof rule.xp_amount !== "number" || rule.xp_amount < 0) {
        return NextResponse.json(
          { success: false, message: "Each rule must have a valid xp_amount (>= 0)" },
          { status: 400 }
        );
      }

      if (typeof rule.is_active !== "boolean") {
        return NextResponse.json(
          { success: false, message: "Each rule must have a boolean is_active" },
          { status: 400 }
        );
      }
    }

    // Convert to proper types
    const validatedRules = rules.map((rule) => ({
      trigger_type: rule.trigger_type as TargetTriggerType,
      xp_amount: rule.xp_amount,
      is_active: rule.is_active,
    }));

    // Save all rules via service
    const result = await gamificationRulesService.saveRules(
      employee.organization_id,
      validatedRules
    );

    return NextResponse.json(result, { status: 200 });
  } catch (error) {
    console.error("Error saving gamification rules:", error);
    const errorMessage =
      error instanceof Error
        ? error.message
        : "An unexpected error occurred while saving gamification rules";

    return NextResponse.json({ success: false, message: errorMessage }, { status: 500 });
  }
}
